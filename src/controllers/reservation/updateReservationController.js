const { Reservation, Room, Refund } = require('../../models');
const { Op } = require('sequelize');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const updateReservationController = async (id, data) => {
  console.log('Datos recibidos en el backend:', data);

  try {
    const paymentId = data.paymentId;

    if (!data.roomId) {
      throw new Error('El campo roomId es obligatorio.');
    }

    // Verificar que la habitación exista
    const room = await Room.findOne({ where: { id: data.roomId } });
    console.log('Room encontrado:', room);
    if (!room) {
      throw new Error(`No se encontró la habitación con id ${data.roomId}`);
    }

    // Buscar la reserva existente
    const reservation = await Reservation.findOne({ where: { id } });
    console.log('Reservation encontrada:', reservation);
    if (!reservation) {
      throw new Error(`No se encontró la reserva con id ${id}`);
    }

    console.log('Datos de la reserva actual:', reservation);
    console.log('Datos enviados para la actualización:', data);

    // Verificar disponibilidad de la habitación
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

    console.log('Reservas superpuestas encontradas:', overlappingReservations);

    if (overlappingReservations.length > 0) {
      throw new Error('La habitación no está disponible para las nuevas fechas.');
    }

    // Calcular días originales y nuevos
    const originalDays = Math.max((new Date(reservation.checkOut) - new Date(reservation.checkIn)) / (1000 * 60 * 60 * 24), 0);
    const newDays = Math.max((new Date(data.checkOut) - new Date(data.checkIn)) / (1000 * 60 * 60 * 24), 0);
    const daysDifference = newDays - originalDays;

    console.log('Días originales:', originalDays);
    console.log('Días nuevos:', newDays);
    console.log('Diferencia de días:', daysDifference);

    // Recalcular el precio total de la reserva
    const totalPrice = newDays * room.price;
    console.log('Precio total recalculado:', totalPrice);
    data.totalPrice = totalPrice;

    if (daysDifference < 0) {
      // Caso: Reembolso
      const daysToRefund = Math.abs(daysDifference);
      const dailyRate = reservation.totalPrice / originalDays;
      const refundAmount = dailyRate * daysToRefund;

      console.log('Monto a reembolsar:', refundAmount);

      // Crear un nuevo registro de reembolso
      await Refund.create({
        reservationId: reservation.id,
        amount: refundAmount.toFixed(2),
        reason: 'Reembolso parcial por cambio de fechas',
      });
    } else if (daysDifference > 0) {
      // Caso: Incremento en el saldo a pagar
      const daysToCharge = daysDifference;
      const dailyRate = room.price;
      const additionalAmount = dailyRate * daysToCharge;

      console.log('Monto adicional a cobrar:', additionalAmount);

      reservation.amountPaid = reservation.amountPaid || 0;
      const newBalance = totalPrice - reservation.amountPaid;

      if (newBalance > 0) {
        console.log('Nuevo saldo pendiente:', newBalance);

        // Crear preferencia de pago en MercadoPago
        const client = new MercadoPagoConfig({
          accessToken: process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN,
        });

        const preference = new Preference(client);

        const preferenceData = {
          items: [
            {
              title: `Reserva en habitación ${room.id}`,
              description: `Días adicionales: ${daysToCharge}`,
              quantity: 1,
              currency_id: 'ARS',
              unit_price: parseFloat(newBalance.toFixed(2)),
            },
          ],
          back_urls: {
            success: `${process.env.CLOUDFLARED_URL}/api/payment/redirect?status=approved&reservationId=${reservation.id}`,
            failure: `${process.env.CLOUDFLARED_URL}/api/payment/redirect?status=failure&reservationId=${reservation.id}`,
            pending: `${process.env.CLOUDFLARED_URL}/api/payment/redirect?status=pending&reservationId=${reservation.id}`,
          },
          auto_return: 'approved',
        };

        try {
          console.log('Datos enviados a MercadoPago:', preferenceData);

          const response = await preference.create({ body: preferenceData });
          console.log('Respuesta de MercadoPago:', response);

          if (!response.id) {
            throw new Error('La respuesta de MercadoPago no contiene el ID de la preferencia.');
          }

          console.log('Preferencia de pago creada:', response);

          return {
            success: true,
            mensaje: 'Reserva actualizada exitosamente. Se requiere un pago adicional.',
            data: {
              reservation: reservation,
              paymentLink: response.init_point,
            },
          };
        } catch (error) {
          console.error('Error al crear la preferencia de pago:', error.message);
          throw new Error('No se pudo crear la preferencia de pago en MercadoPago.');
        }
      }
    }

    // Actualizar la reserva
    const updated = await reservation.update({
      paymentId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      numberOfGuests: parseInt(data.numberOfGuests, 10),
      roomId: data.roomId,
      status: data.status.toLowerCase(),
      totalPrice,
    });

    return {
      success: true,
      mensaje: 'Reserva actualizada exitosamente',
      data: updated,
    };
  } catch (error) {
    console.error('Error al actualizar la reserva:', error.message);
    throw new Error(`Error al actualizar la reserva: ${error.message}`);
  }
};

module.exports = updateReservationController;