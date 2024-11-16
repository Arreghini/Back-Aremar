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
const getAvailableRoomsController = async (roomType, checkInDate, checkOutDate, numberOfGuests) => {
  try {
    console.log('Iniciando búsqueda de habitaciones...');
    
    // Verificar reservas solapadas
    const overlappingReservations = await Reservation.findAll({
      where: {
        status: 'confirmed',
        [Op.or]: [
          {
            checkIn: {
              [Op.between]: [checkInDate, checkOutDate]
            }
          },
          {
            checkOut: {
              [Op.between]: [checkInDate, checkOutDate]
            }
          },
          {
            [Op.and]: [
              { checkIn: { [Op.lte]: checkInDate } },
              { checkOut: { [Op.gte]: checkOutDate } }
            ]
          }
        ]
      }
    });
    
    console.log('Reservas solapadas encontradas:', overlappingReservations.length);
    
    const reservedRoomIds = overlappingReservations.map(res => res.roomId);
    console.log('IDs de habitaciones reservadas:', reservedRoomIds);

    // Buscar habitaciones disponibles
    const rooms = await Room.findAll({
      where: {
        roomTypeId: roomType,
        id: {
          [Op.notIn]: reservedRoomIds
        },
        status: 'available'
      },
      include: [{
        model: RoomType,
        required: true
      }]
    });

    console.log('Habitaciones encontradas:', rooms.length);
    
    return rooms;
  } catch (error) {
    console.log('Error específico:', error.message);
    throw error;
  }
};

// Exportar controladores
const getRoomController = {
  getAllRoomController,
  getAvailableRoomsController,
};

module.exports = getRoomController;
