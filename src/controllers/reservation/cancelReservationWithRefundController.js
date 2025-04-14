const { Reservation, Refund } = require('../../models');
const { Op } = require('sequelize');

const cancelReservationWithRefundController = async ({ reservationId, userId, isAdmin }) => {
  const reservation = await Reservation.findByPk(reservationId);

  if (!reservation) throw new Error('Reserva no encontrada');
  if (reservation.status === 'cancelded') {
    throw new Error('Esta reserva ya ha sido cancelada');
  }
  if (!isAdmin && reservation.userId !== userId) {
    throw new Error('No tienes permiso para cancelar esta reserva');
  }

  const today = new Date();
  const checkInDate = new Date(reservation.checkInDate);
  const daysBeforeCheckIn = Math.floor((checkInDate - today) / (1000 * 60 * 60 * 24));

  let refundAmount = 0;

  // 💡 Ejemplo de política de reembolso
  if (daysBeforeCheckIn >= 7) {
    refundAmount = reservation.totalPrice * 0.9;
  } else if (daysBeforeCheckIn >= 3) {
    refundAmount = reservation.totalPrice * 0.5;
  } else {
    refundAmount = reservation.totalPrice * 0.1;
  }

  const refund = await Refund.create({
    amount: refundAmount.toFixed(2),
    reason: isAdmin ? 'Cancelación por administrador' : 'Cancelación por usuario',
  });

  reservation.status = 'cancelled';
  reservation.refundId = refund.id;
  await reservation.save();

  return { refundAmount, refundId: refund.id };
};

module.exports = cancelReservationWithRefundController;
