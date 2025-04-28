const { Reservation, Room, User, RoomType } = require('../../models')

// Controlador para obtener todas las reservas
const getAllReservationController = async () => {
    try {
        const reservations = await Reservation.findAll({
            attributes: ['id', 'checkIn', 'checkOut', 'numberOfGuests','amountPaid', 'status', 'type'],
            include: [
                {
                    model: Room,
                    attributes: ['id', 'status'], // Atributos relevantes de Room
                    include: [
                        {
                            model: RoomType,
                            attributes: ['name'] // Atributos relevantes de RoomType
                        }
                    ]
                },
                {
                    model: User,
                    attributes: ['id', 'name', 'email'], // Atributos relevantes de User
                },
            ],
        });
        return reservations;
    } catch (error) {
        console.error('Error al obtener todas las reservas:', error.message);
        throw new Error('Hubo un problema al obtener las reservas. Inténtelo nuevamente más tarde.');
    }
};

// Controlador para obtener reservas de un usuario por su ID
const getReservationByUserIdController = async (userId) => {
    // Agregar el prefijo si no está presente
    const formattedUserId = userId.includes('google-oauth2|') 
        ? userId 
        : `google-oauth2|${userId}`;
        
    console.log('Buscando reservas con userId formateado:', formattedUserId);
    
    try {
        const reservations = await Reservation.findAll({
            where: { 
                userId: formattedUserId
            },
            attributes: ['id', 'checkIn', 'checkOut', 'totalPrice', 'numberOfGuests','amountPaid' , 'status'],
            include: [
                {
                    model: Room,
                    attributes: ['id', 'status'],
                    include: [{
                        model: RoomType,
                        attributes: ['name']
                    }]
                },
                {
                    model: User,
                    attributes: ['id', 'name', 'email']
                }
            ],
        });
        
        console.log('Reservas encontradas:', reservations.length);
        return reservations;
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        throw error;
    }
};

// Controlador para obtener una reserva por su ID
const getReservationByIdController = async (reservationId) => {
    try {
      const reservation = await Reservation.findOne({
        where: { id: reservationId },
        attributes: ['id', 'checkIn', 'checkOut', 'totalPrice', 'status','amountPaid', 'type'], 
        include: [
          {
            model: Room,
            attributes: ['id', 'description', 'status'],
            include: [{
              model: RoomType,
              attributes: ['name']
            }]
          },
          {
            model: User,
            attributes: ['id', 'name', 'email']
          }
        ]
      });
      return reservation;
    } catch (error) {
      throw error;
    }
  };  

// Exportar los controladores
const getReservationController = {
    getAllReservationController,
    getReservationByUserIdController,
    getReservationByIdController,
};

module.exports = getReservationController;
