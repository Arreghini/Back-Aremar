const confirmedResevationByAdminController = require('../../controllers/reservation/confirmedReservationByAdminController');

const confirmedReservationByAdminHandler = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { amountPaid } = req.body; // Obtener el monto pagado del cuerpo de la solicitud
    const isAdmin = req.isAdmin || false;

    if (!isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. Solo los administradores pueden confirmar reservas.' });
    }

    if (!reservationId) {
      return res.status(400).json({ error: 'ID de reserva no proporcionado.' });
    }

    if (!amountPaid || isNaN(amountPaid) || amountPaid <= 0) {
      return res.status(400).json({ error: 'Monto pagado inválido.' });
    }

    const confirmedReservation = await confirmedResevationByAdminController(reservationId, amountPaid);
    res.status(200).json(confirmedReservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = confirmedReservationByAdminHandler;