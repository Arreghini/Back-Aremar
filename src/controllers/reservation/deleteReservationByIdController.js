const { Reservation } = require('../../models');

const deleteReservationByIdController = async (id) => {
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('Error al eliminar la reserva: ID inválido');
  }

  try {
    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
     return false;  
    }

    if (reservation.status !== 'pendiente') {
      throw new Error('Error al eliminar la reserva: Solo puedes eliminar reservas en estado pendiente');
    }

    await reservation.destroy();

    return true;
  } catch (error) {
    if (error.message.startsWith('Error al eliminar la reserva:')) {
      throw error;
    }

    throw new Error(`Error al eliminar la reserva: ${error.message}`);
  }
};

module.exports = deleteReservationByIdController;
