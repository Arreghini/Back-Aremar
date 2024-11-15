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
}
const getAvailableRooms = async (req, res) => {
  const { roomType } = req.query;
  console.log('Buscando habitaciones para tipo:', roomType);

  try {
    const rooms = await getRoomController.getAvailableRoomsController(null, null, null, roomType);
    
    return res.status(200).json({
      success: true,
      totalRooms: rooms.length,
      rooms: rooms
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
