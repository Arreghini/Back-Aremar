const deleteReservationByIdController = require('../../controllers/reservation/deleteReservationByIdController');

const deleteReservationByIdHandler = async (req, res) => {
  const { reservationId } = req.params;

  // Validación básica
  if (!reservationId) {
    return res.status(400).json({ error: 'El ID de la reserva es obligatorio' });
  }

  try {
    const deletedReservation = await deleteReservationByIdController(reservationId);
    console.log('Reserva cancelada exitosamente:', deletedReservation);

    res.status(200).json({ message: 'Reserva cancelada con éxito', data: deletedReservation });
  } catch (error) {
    console.error('Error en la cancelación de la reserva:', error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = deleteReservationByIdHandler;
