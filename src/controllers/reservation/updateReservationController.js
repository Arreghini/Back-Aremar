const { Reservation, Room } = require('../../models');
const { Op } = require('sequelize');
const { processRefund } = require('../../services/refundService');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const updateReservationController = async (id, data) => {
  try {
    const paymentId = data.paymentId;

    if (!data.roomId) {
      throw new Error('El campo roomId es obligatorio.');
    }

    const room = await Room.findOne({ where: { id: data.roomId } });
    if (!room)
      throw new Error(`No se encontró la habitación con id ${data.roomId}`);

    const reservation = await Reservation.findOne({ where: { id } });
    if (!reservation) throw new Error(`No se encontró la reserva con id ${id}`);

    const overlappingReservations = await Reservation.findAll({
      where: {
        roomId: data.roomId,
        id: { [Op.ne]: id },
        [Op.and]: [
          { checkIn: { [Op.lt]: new Date(data.checkOut) } },
          { checkOut: { [Op.gt]: new Date(data.checkIn) } },
        ],
      },
    });

    if (overlappingReservations.length > 0) {
      return {
        success: false,
        mensaje: 'La habitación ya está reservada en esas fechas.',
        data: null,
      };
    }

    const originalDays =
      (new Date(reservation.checkOut) - new Date(reservation.checkIn)) /
      (1000 * 60 * 60 * 24);
    const newDays =
      (new Date(data.checkOut) - new Date(data.checkIn)) /
      (1000 * 60 * 60 * 24);
    const daysDifference = newDays - originalDays;

    const dailyRate =
      originalDays > 0 ? reservation.totalPrice / originalDays : room.price;
    const totalPrice = newDays * dailyRate;
    data.totalPrice = totalPrice;

    let mensaje = 'Reserva actualizada exitosamente';

    // ▶️ Reembolso parcial
    if (daysDifference < 0 && data.totalPrice < reservation.amountPaid) {
      const refundAmount = Math.abs(daysDifference) * dailyRate;

      const refundResult = await processRefund({
        reservationId: reservation.id,
        paymentId: reservation.paymentId,
        amount: refundAmount,
        reason: 'Reembolso parcial por cambio de fechas',
      });

      if (!refundResult.success) {
        throw new Error(refundResult.mensaje);
      }

      mensaje += ` con reembolso de $${refundAmount.toFixed(2)}`;
    }

    // ▶️ Pago adicional
    let paymentLink = null;
    if (daysDifference > 0) {
      const additionalAmount = daysDifference * dailyRate;
      reservation.amountPaid = reservation.amountPaid || 0;
      const newBalance = totalPrice - reservation.amountPaid;

      if (newBalance > 0) {
        const preference = new Preference(client);
        const preferenceData = {
          body: {
            items: [
              {
                title: `Reserva en habitación ${room.id}`,
                description: `Días adicionales: ${daysDifference}`,
                quantity: 1,
                currency_id: 'ARS',
                unit_price: Number(newBalance.toFixed(2)),
              },
            ],
            back_urls: {
              success: `${process.env.CLOUDFLARED_URL}/api/payment/redirect?status=approved&reservationId=${reservation.id}`,
              failure: `${process.env.CLOUDFLARED_URL}/api/payment/redirect?status=failure&reservationId=${reservation.id}`,
              pending: `${process.env.CLOUDFLARED_URL}/api/payment/redirect?status=pending&reservationId=${reservation.id}`,
            },
            auto_return: 'approved',
          },
        };

        const response = await preference.create(preferenceData);
        console.log('Respuesta de mercadopago.preferences.create:', response);

        if (!response?.id && !response?.init_point) {
          throw new Error('No se recibió un ID de preferencia de pago');
        }

        paymentLink = response.init_point;
        mensaje += `. Se requiere un pago adicional de $${newBalance.toFixed(2)}`;
      }
    }

    // ▶️ Actualizar reserva
    const updated = await reservation.update(
      {
        paymentId: data.paymentId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        numberOfGuests: parseInt(data.numberOfGuests, 10),
        roomId: data.roomId,
        status: data.status.toLowerCase(),
        totalPrice: data.totalPrice,
      },
      {
        fields: [
          'paymentId',
          'checkIn',
          'checkOut',
          'numberOfGuests',
          'roomId',
          'status',
          'totalPrice',
        ],
      }
    );

    // ▶️ Respuesta final
    return {
      success: true,
      mensaje,
      data: {
        reservation: updated,
        ...(paymentLink && { paymentLink }),
      },
    };
  } catch (error) {
    console.error('Error al actualizar la reserva:', error.message);
    throw new Error(`Error al actualizar la reserva: ${error.message}`);
  }
};

module.exports = updateReservationController;
