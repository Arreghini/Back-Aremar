const { Reservation, Refund } = require('../../models');
const { Op } = require('sequelize');

const partialRefundController = async (
  reservationId,
  newCheckOutDate,
  newCheckInDate
) => {
  try {
    // Buscar la reserva por ID
    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    // Verificar que la reserva esté en estado "confirmed"
    if (reservation.status !== 'confirmed') {
      throw new Error('La reserva no está en estado confirmado');
    }

    const originalDays = Math.ceil(
      (new Date(reservation.checkOut) - new Date(reservation.checkIn)) /
        (1000 * 60 * 60 * 24)
    );
    const newDays = Math.ceil(
      (new Date(newCheckOutDate) - new Date(reservation.checkIn)) /
        (1000 * 60 * 60 * 24)
    );
    const daysToRefund = originalDays - newDays;
    if (daysToRefund <= 0) {
      throw new Error(
        'No se puede realizar un reembolso parcial si la nueva fecha de salida es igual o posterior a la original'
      );
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
    // Actualizar la reserva con las nuevas fechas
    reservation.checkOut = newCheckOutDate;
    reservation.checkIn = newCheckInDate;
    reservation.refundId = refund.id;
    reservation.totalPrice -= refundAmount;
    await reservation.save();

    return { refundAmount, refundId: refund.id };
  } catch (error) {
    console.error('Error al procesar el reembolso parcial:', error.message);
    throw new Error(`Error al procesar el reembolso parcial: ${error.message}`);
  }
};

module.exports = partialRefundController;
