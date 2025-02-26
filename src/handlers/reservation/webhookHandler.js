const webhookController = require('../../controllers/reservation/webHookController');

const webhookHandler = () => async (req, res) => {
  try {
      await webhookController(req, res);
  } catch (error) {
      console.error('Error en webhook:', error);
      res.status(500).send();
  }
};

module.exports = webhookHandler;
