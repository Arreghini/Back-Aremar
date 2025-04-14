const { Reservation } = require('../../models');

const cancelReservationController = async ({ reservationId, userId, isAdmin }) => {
  const reservation = await Reservation.findByPk(reservationId);

  if (!reservation) throw new Error('Reserva no encontrada');

  if (reservation.status === 'cancelled') {
    throw new Error('Esta reserva ya ha sido cancelada');
  }

  if (!isAdmin) {
    throw new Error('No tienes permiso para cancelar esta reserva');
  }

  await reservation.update({ status: 'cancelled' });
  return 'Reserva cancelada exitosamente';
};

module.exports = cancelReservationController;
