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
  try {
    const { numberOfGuests, checkInDate, checkOutDate, roomType } = req.query;
    
    console.log('Datos recibidos:', {
      numberOfGuests,
      checkInDate,
      checkOutDate,
      roomType
    });

    const availableRooms = await getRoomController.getAvailableRoomsController(
      numberOfGuests,
      checkInDate,
      checkOutDate,
      roomType
    );

    return res.status(200).json(availableRooms);
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
