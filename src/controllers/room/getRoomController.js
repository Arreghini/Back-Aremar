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
    console.log('Iniciando búsqueda de habitaciones disponibles');
    
    // Primero verificamos si hay habitaciones sin filtrar por tipo
    const allRooms = await Room.findAll({
      include: [{
        model: RoomType,
      }]
    });

    console.log('Total de habitaciones en sistema:', allRooms.length);
    
    // Luego buscamos con el filtro específico
    const rooms = await Room.findAll({
      where: {
        roomTypeId: roomType,
      },
      include: [{
        model: RoomType,
        attributes: ['name', 'simpleBeds', 'trundleBeds', 'kingBeds']
      }]
    });

    console.log('Detalles completos:', {
      habitacionesTotales: allRooms.length,
      habitacionesDelTipo: rooms.length,
      tipoHabitacion: roomType
    });

    return rooms;

  } catch (error) {
    console.error('Error en la búsqueda:', error);
    throw error;
  }
};

// Exportar controladores
const getRoomController = {
  getAllRoomController,
  getAvailableRoomsController,
};

module.exports = getRoomController;
