const confirmedResevationByAdminController = require('../../controllers/reservation/confirmedReservationByAdminController');

const confirmedReservationByAdminHandler = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const updatedData = req.body;
    console.log('Datos de la reserva a confirmar:', updatedData);
    const isAdmin = req.isAdmin || false;

    if (!isAdmin) {
      return res
        .status(403)
        .json({
          error:
            'Acceso denegado. Solo los administradores pueden confirmar reservas.',
        });
    }

    if (!reservationId) {
      return res.status(400).json({ error: 'ID de reserva no proporcionado.' });
    }

    if (
      !updatedData.amountPaid ||
      isNaN(updatedData.amountPaid) ||
      updatedData.amountPaid <= 0
    ) {
      return res.status(400).json({ error: 'Monto pagado inválido.' });
    }

    const confirmedReservation = await confirmedResevationByAdminController(
      reservationId,
      updatedData
    );
    res.status(200).json(confirmedReservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = confirmedReservationByAdminHandler;
