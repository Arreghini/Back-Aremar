const { Reservation } = require('../../models');

const deleteReservationByIdController = async (reservationId, isAdmin) => {
  try {
    const reservation = await Reservation.findByPk(reservationId);

    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    const { status } = reservation;
    console.log('Estado de la reserva y es Administrador?:', status, isAdmin)

    // Validación para usuarios comunes
    if (!isAdmin && status !== 'pending') {
      throw new Error('Solo puedes eliminar reservas en estado pendiente');
    }

    // Validación para administradores
    if (isAdmin && !['pending', 'confirmed'].includes(status)) {
      throw new Error('Como administrador solo puedes eliminar reservas pendientes o confirmadas');
    }

    await reservation.destroy();
    return 'Reserva eliminada exitosamente';
  } catch (error) {
    throw new Error(`Error al eliminar la reserva: ${error.message}`);
  }
};

module.exports = deleteReservationByIdController;
