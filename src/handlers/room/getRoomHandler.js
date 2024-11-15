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
  console.log('Solicitud Get Available', req.query);
  try {
    const { numberOfGuests, checkInDate, checkOutDate, roomType } = req.query;
    
    // Convertir las fechas a objetos Date
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const availableRooms = await getRoomController.getAvailableRoomsController(
      numberOfGuests,
      checkIn,
      checkOut,
      roomType
    );

    console.log('Rooms sent to client:', availableRooms);
    return res.status(200).json({
      message: `Se encontraron ${availableRooms.length} habitaciones disponibles`,
      data: availableRooms
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al obtener habitaciones disponibles', 
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
