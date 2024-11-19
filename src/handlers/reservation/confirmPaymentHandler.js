const confirmPaymentController = require('../../controllers/reservation/confirmPaymentController');

const confirmPaymentHandler = async (req, res) => {
    try {
      const { reservationId } = req.body;
      const confirmedReservation = await confirmPaymentController(reservationId);
      res.status(200).json(confirmedReservation);
    } catch (error) {
      console.error('Error al confirmar el pago:', error.message);
      res.status(500).json({ error: 'Error al confirmar el pago' });
    }
  };
  module.exports = confirmPaymentHandler;
  