const cancelReservationControllerByAdmin = require('../../controllers/reservation/cancelReservationControllerByAdmin.js');

const cancelReservationByAdminHandler = async (req, res) => {
  const { reservationId } = req.params;
  const isAdmin = req.isAdmin || false;
  try {
    const reserva = await cancelReservationControllerByAdmin({
      reservationId,
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

module.exports = cancelReservationByAdminHandler;
