const { Room, RoomType, Reservation } = require('../../models');
const { Op } = require('sequelize'); // Importar Op para usar operadores

// Controlador para obtener todas las habitaciones
const getAllRoomController = async () => {
  try {
    const rooms = await Room.findAll();
    return rooms;
  } catch (error) {
    console.error('Error fetching rooms:', error); // Agregar log para errores
    throw error;
  }
};
const getAvailableRoomsController = async (numberOfGuests, checkInDate, checkOutDate, roomType) => {
  try {
    const rooms = await Room.findAll({
      where: {
        roomTypeId: roomType
      },
      include: [{
        model: RoomType,
        required: true
      }],
      raw: false
    });

    const formattedRooms = rooms.map(room => {
      return {
        id: room.id,
        description: room.description,
        price: room.price,
        status: room.status,
        roomTypeId: room.roomTypeId,
        roomTypeName: room.RoomType ? room.RoomType.name : null
      };
    });

    console.log('Habitaciones formateadas:', JSON.stringify(formattedRooms, null, 2));
    return formattedRooms;

  } catch (error) {
    console.log('Error en la búsqueda:', error);
    throw error;
  }
};

// Exportar controladores
const getRoomController = {
  getAllRoomController,
  getAvailableRoomsController,
};

module.exports = getRoomController;
