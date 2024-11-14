const { Room, Reservation } = require('../../models');
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

// Controlador para obtener habitaciones disponibles
const getAvailableRoomsController = async (numberOfGuests, checkInDate, checkOutDate, roomType) => {
  try {
    // Validamos que tengamos todos los parámetros necesarios
    if (!checkInDate || !checkOutDate) {
      throw new Error('Las fechas son requeridas');
    }

    // Construimos el objeto de consulta base
    const whereClause = {
      status: 'available'
    };

    // Solo agregamos roomType si está presente
    if (roomType) {
      whereClause.roomTypeId = roomType;
    }

    const rooms = await Room.findAll({
      where: whereClause,
      include: [{
        model: Reservation,
        required: false,
        where: {
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
            }
          ]
        }
      }]
    });

    // Filtramos las habitaciones que no tienen reservas en ese período
    const availableRooms = rooms.filter(room => !room.Reservations?.length);

    return availableRooms;
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    throw error;
  }
};


// Exportar controladores
const getRoomController = {
  getAllRoomController,
  getAvailableRoomsController,
};

module.exports = getRoomController;
