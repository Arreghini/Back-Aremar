const cancelReservationController = require('../../controllers/reservation/cancelReservationController.js');

const cancelReservationHandler = async (req, res) => {
  const { reservationId } = req.params;
  const userId = req.user?.id; 
  const isAdmin = req.isAdmin || false;

  try {
    const reserva = await cancelReservationController({
      reservationId,
      userId,
      isAdmin
    });

    res.status(200).json({
      message: 'Reserva cancelada exitosamente',
    });
  } catch (error) {
    console.error('Error al cancelar la reserva:', error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = cancelReservationHandler;
