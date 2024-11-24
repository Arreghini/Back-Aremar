const { Reservation } = require('../../models');

const deleteReservationById = async (reservationId) => {
  try {
    const reservation = await Reservation.findOne({
      where: {
        id: reservationId,
        status: 'pending',
      },
    });

    if (!reservation) {
      throw new Error('No se encontró la reserva o no está pendiente.');
    }

    // Elimina la reserva
    await reservation.destroy();

    return 'Reserva eliminada con éxito';
  } catch (error) {
    throw new Error(`Error eliminando la reserva: ${error.message}`);
  }
};

module.exports = deleteReservationById;
