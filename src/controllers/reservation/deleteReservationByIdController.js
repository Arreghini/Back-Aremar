const { Reservation } = require('../../models');

const deleteReservationByIdController = async (reservationId) => {
  try {
    const rowsDeleted = await Reservation.destroy({
      where: {
        id: reservationId,
        status: 'pending', // Solo eliminar reservas en estado 'pending'
      },
    });

    if (rowsDeleted === 0) {
      throw new Error('No se encontró la reserva o no está pendiente.');
    }

    return `Reserva eliminada con éxito. Reservas afectadas: ${rowsDeleted}`;
  } catch (error) {
    throw new Error(`Error eliminando la reserva: ${error.message}`);
  }
};

module.exports = deleteReservationByIdController;
