const webhookController = require('../../controllers/reservation/webHookController');

const webhookHandler = () => async (req, res) => {
  try {
      console.log('Webhook recibido en handler');
      console.log('Método:', req.method);
      console.log('Headers:', req.headers);
      console.log('Body:', req.body);
      
      await webhookController(req, res);
  } catch (error) {
      console.error('Error en webhook handler:', error);
      res.status(500).send();
  }
};

module.exports = webhookHandler;
