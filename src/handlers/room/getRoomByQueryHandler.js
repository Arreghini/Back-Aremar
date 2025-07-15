const getRoomsController = require('../../controllers/room/getRoomByQuery');

const getRoomByQueryHandler = async (req, res) => {
  try {
    await getRoomsController(req, res); // esto es importante: el controller maneja el res
  } catch (error) {
    console.error('Error en getRoomByQueryHandler:', error);
    res.status(500).json({ error: 'Internal server error' }); // <- aquí está fallando porque res es undefined
  }
};
module.exports = getRoomByQueryHandler;
