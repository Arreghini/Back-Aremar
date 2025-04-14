const deleteReservationByIdController = require('../../controllers/reservation/deleteReservationByIdController.js');

const deleteReservationByIdHandler = async (req, res) => {
  console.log('deleteReservationByIdHandler recibió una solicitud');
  const { reservationId } = req.params;
  const isAdmin = req.isAdmin || false; // Verifica si el usuario es administrador

  console.log('isAdmin:', isAdmin);
  if (!reservationId) {
    return res.status(400).json({ error: 'El ID de la reserva es obligatorio' });
  }

  try {
    const deletedReservation = await deleteReservationByIdController(reservationId, isAdmin);
    console.log('Reserva cancelada exitosamente:', deletedReservation);
    res.status(200).json({ message: 'Reserva cancelada con éxito', data: deletedReservation });
  } catch (error) {
    console.error('Error en la cancelación de la reserva:', error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = deleteReservationByIdHandler;
