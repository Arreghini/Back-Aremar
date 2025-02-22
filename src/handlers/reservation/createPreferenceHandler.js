const createPreferenceController = require('../../controllers/reservation/createPreferenceController');

const createPreferenceHandler = async (req, res) => {
    try {
      const { reservationId, amount, currency } = req.body;
      const preference = await createPreferenceController(reservationId, amount, currency);
      return res.status(200).json({ preferenceId: preference.id });
    } catch (error) {
      console.error('Error al crear preferencia:', error);
      return res.status(500).json({ error: 'Error al crear preferencia de pago' });
    }
  };
  
  module.exports = createPreferenceHandler;

  