const { Room, RoomType, Reservation } = require('../../models');
const { Op } = require('sequelize');

// Utilidad para buscar reservas solapadas
const findOverlappingReservations = async (roomId, checkInDate, checkOutDate) => {
  return await Reservation.findAll({
    where: {
      ...(roomId && { roomId }), // Agrega el filtro por roomId solo si existe
      status: {
        [Op.in]: ['confirmed', 'pending']
      },
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
};

// Controlador para obtener habitaciones disponibles por tipo
const getAvailableRoomsController = async (roomType, checkInDate, checkOutDate, numberOfGuests) => {
  try {
    console.log('Iniciando búsqueda de habitaciones...');

    // Verificar reservas solapadas
    const overlappingReservations = await findOverlappingReservations(null, checkInDate, checkOutDate);
    const reservedRoomIds = overlappingReservations.map(res => res.roomId);

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
    console.error('Error específico:', error.message);
    throw error;
  }
};

// Controlador para verificar disponibilidad de una habitación específica
const getAvailableRoomByIdController = async (roomId, checkInDate, checkOutDate, numberOfGuests) => {
  try {
    console.log('Verificando disponibilidad para la habitación:', roomId);

    // Verificar reservas solapadas
    const overlappingReservations = await findOverlappingReservations(roomId, checkInDate, checkOutDate);

    if (overlappingReservations.length > 0) {
      console.log('La habitación está reservada en el rango de fechas dado.');
      return null; // Indica que la habitación no está disponible
    }

    // Obtener la habitación
    const room = await Room.findOne({
      where: { id: roomId, status: 'available' },
      include: [{
        model: RoomType,
        required: true
      }]
    });

    console.log('Habitación encontrada:', room ? room.id : 'Ninguna');
    return room;
  } catch (error) {
    console.error('Error específico:', error.message);
    throw error;
  }
};

// Controlador para obtener todas las habitaciones
const getAllRoomController = async () => {
  try {
    const rooms = await Room.findAll();
    return rooms;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

// Exportar controladores
const getRoomController = {
  getAllRoomController,
  getAvailableRoomsController,
  getAvailableRoomByIdController,
};

module.exports = getRoomController;
