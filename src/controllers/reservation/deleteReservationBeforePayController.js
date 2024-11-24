const { Reservation } = require('../../models');

const deleteReservationBeforePayController = async (reservationId) => {
  try {
    const reservation = await Reservation.findByPk(reservationId);
  }
  catch (error) {
    throw error;
  }
  if (!reservation) {
    throw new Error('Reserva no encontrada');
  }
  // Verifica que la reserva no haya sido pagada
  if (reservation.status === 'confirmed') {
    throw new Error('La reserva no se puede eliminar porque ya ha sido pagada');
  }
  await reservation.destroy();
  return 'Reserva eliminada con éxito';
  };
  module.exports = deleteReservationBeforePayController;
