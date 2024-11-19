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

  // Aseguramos que se pasen los parámetros necesarios
  if (!roomType || !checkInDate || !checkOutDate || !numberOfGuests) {
    return res.status(400).json({
      success: false,
      message: 'Faltan parámetros necesarios: roomType, checkInDate, checkOutDate, numberOfGuests',
    });
  }

  console.log('Buscando habitaciones disponibles para el tipo:', roomType);

  try {
    // Aquí ya no pasamos null, sino los valores correctos obtenidos de req.query
    const rooms = await getRoomController.getAvailableRoomsController(
      roomType, checkInDate, checkOutDate, numberOfGuests
    )
    return res.status(200).json({
      success: true,
      totalRooms: rooms.length,
      rooms: rooms,
    });
    
  } catch (error) {
    console.log('Error en handler:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en la búsqueda de habitaciones',
      error: error.message
    });
  }
};

const getRoom  = {
  getAllRooms,
  getAvailableRooms,
};
// Exportar el controlador para obtener habitaciones
module.exports = getRoom;
