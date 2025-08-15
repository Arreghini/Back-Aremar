const getRoomDetailController = require('../../../controllers/room/roomDetail/getRoomDetailController');

const getRoomDetailHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const roomDetails = await getRoomDetailController(id);

    return res.status(200).json(roomDetails);
  } catch (error) {
    console.error('Error inesperado al manejar la solicitud:', error);
    return res.status(500).send('Error al manejar la solicitud');
  }
};

module.exports = getRoomDetailHandler;
