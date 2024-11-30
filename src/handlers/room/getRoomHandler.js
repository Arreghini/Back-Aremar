const getRoomController = require('../../controllers/room/getRoomController');

const getAllRooms = async (req, res) => {
  try {
    console.log('Solicitud GET /api/rooms/all recibida'); 
    const rooms = await getRoomController.getAllRoomController();
   // console.log('Rooms sent to client:', rooms);
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error in getRoom handler:', error);
    res.status(500).json({ message: error.message });
  }
};
const getAvailableRooms = async (req, res) => {
  const { roomType, checkInDate, checkOutDate, numberOfGuests } = req.query;

  if (!roomType || !checkInDate || !checkOutDate || !numberOfGuests) {
    return res.status(400).json({
      success: false,
      message: 'Faltan parámetros necesarios: roomType, checkInDate, checkOutDate, numberOfGuests',
    });
  }

  try {
    const rooms = await getRoomController.getAvailableRoomsController(
      roomType,
      checkInDate,
      checkOutDate,
      numberOfGuests
    );
    return res.status(200).json({
      success: true,
      totalRooms: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error('Error en handler:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en la búsqueda de habitaciones',
      error: error.message,
    });
  }
};

const getAvailableRoomById = async (req, res) => {
  const { checkInDate, checkOutDate, numberOfGuests } = req.query;
  const { roomId } = req.params;

  if (!roomId || !checkInDate || !checkOutDate || !numberOfGuests) {
    return res.status(400).json({
      success: false,
      message: 'Faltan parámetros necesarios: roomId, checkInDate, checkOutDate, numberOfGuests',
    });
  }

  try {
    const room = await getRoomController.getAvailableRoomsByIdController(
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests
    );
    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error('Error en handler:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en la búsqueda de la habitación',
      error: error.message,
    });
  }
};

const getRoom  = {
  getAllRooms,
  getAvailableRooms,
  getAvailableRoomById,
};
// Exportar el controlador para obtener habitaciones
module.exports = getRoom;
