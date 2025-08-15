const getAllRoomDetailsController = require('../../../controllers/room/roomDetail/getAllRoomDetailsController');

const getAllRoomDetailsHandler = async (req, res) => {
  try {
    const roomDetails = await getAllRoomDetailsController();
    return res.status(200).json({ success: true, data: roomDetails });
  } catch (error) {
    console.error('Error inesperado al manejar la solicitud:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = getAllRoomDetailsHandler;
