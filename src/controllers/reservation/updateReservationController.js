const { Reservation, Room, Refund } = require('../../models');
const { Op } = require('sequelize');
const { MercadoPagoConfig } = require('mercadopago')

const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN,
    });

const updateReservationController = async (id, data) => {
  console.log('Datos recibidos en el backend:', data);
  console.log("Tipo de ID:", typeof id);
  console.log("Tipo de numberOfGuests:", typeof data.numberOfGuests);

  try {
    if (!data.roomId) {
      throw new Error('El campo roomId es obligatorio.');
    }

    // Verificar que la habitación exista
    const room = await Room.findOne({ where: { id: data.roomId } });
    if (!room) {
      throw new Error(`No se encontró la habitación con id ${data.roomId}`);
    }

    // Buscar la reserva existente
    const reservation = await Reservation.findOne({ where: { id } });
    if (!reservation) {
      throw new Error(`No se encontró la reserva con id ${id}`);
    }

    // Verificar disponibilidad de la habitación
    const overlappingReservations = await Reservation.findAll({
      where: {
        roomId: data.roomId,
        id: { [Op.ne]: id },
        checkIn: { [Op.lt]: new Date(data.checkOut) },
        checkOut: { [Op.gt]: new Date(data.checkIn) },
      },
    });

    if (overlappingReservations.length > 0) {
      throw new Error('La habitación no está disponible para las nuevas fechas.');
    }

    const originalDays = Math.max((new Date(data.checkOut) - new Date(data.checkIn)) / (1000 * 60 * 60 * 24), 0);
    const newDays = Math.max((new Date(reservation.checkOut) - new Date(reservation.checkIn)) / (1000 * 60 * 60 * 24), 0);
    const daysToRefund = originalDays - newDays;
    if (daysToRefund <= 0) {
      throw new Error('No se puede realizar un reembolso parcial si la nueva fecha de salida es igual o posterior a la original');
    }
    // Calcular el monto a reembolsar
    const dailyRate = reservation.totalPrice / originalDays;
    const refundAmount = dailyRate * daysToRefund;
    // Crear un nuevo registro de reembolso
    const refund = await Refund.create({
      reservationId: reservation.id,
      amount: refundAmount.toFixed(2),
      reason: 'Reembolso parcial por cambio de fecha de salida',
    });
    
    // Recalcular el precio total de la reserva
    const checkInDate = new Date(data.checkIn);
    const checkOutDate = new Date(data.checkOut);
    const days = Math.max((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24), 0);
    const totalPrice = days * room.price;

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
