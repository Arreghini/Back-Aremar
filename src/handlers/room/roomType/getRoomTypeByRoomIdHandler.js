const getRoomTypeByRoomIdController = require('../../../controllers/room/roomType/getRoomTypeByRoomIdController');

const getRoomTypeByRoomIdHandler = async (req, res) => {
  const { roomId } = req.params;

  try {
    console.log('[Handler] Solicitando tipo de habitación para ID:', roomId);

    const roomType = await getRoomTypeByRoomIdController(roomId);

    if (!roomType) {
      return res.status(404).json({ message: 'Room not found' });
    }

    console.log('[Handler] Tipo de habitación encontrado:', roomType);
    return res.status(200).json(roomType);
  } catch (error) {
    console.error(
      '[Handler] Error al obtener tipo de habitación:',
      error.message
    );
    return res.status(500).json({ message: error.message });
  }
};

module.exports = getRoomTypeByRoomIdHandler;
