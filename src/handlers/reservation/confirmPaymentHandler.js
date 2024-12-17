const confirmPaymentController = require('../../controllers/reservation/confirmPaymentController');

const confirmPaymentHandler = async (req, res) => {
    try {
      const { reservationId } = req.body;
      const result = await confirmPaymentController(reservationId);
      
      if (result.status === 'already_confirmed') {
        return res.status(200).json({
          message: result.message,
          reservation: result.reservation
        });
      }

      res.status(200).json({
        message: result.message,
        reservation: result.reservation
      });
    } catch (error) {
      console.error('Error al confirmar el pago:', error.message);
      res.status(500).json({ error: error.message });
    }
};

module.exports = confirmPaymentHandler;
