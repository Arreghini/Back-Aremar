const { Reservation, Room, User, RoomType } = require('../../models')

// Controlador para obtener todas las reservas
const getAllReservationController = async () => {
    try {
        const reservations = await Reservation.findAll({
            attributes: ['id', 'roomId','checkIn', 'checkOut', 'numberOfGuests','amountPaid', 'status', 'totalPrice', 'paymentId'],
            include: [
                {
                    model: Room,
                    as: 'room',
                    attributes: ['id', 'status'],
                    include: [
                      {
                        model: RoomType,
                        as: 'roomType',
                        attributes: ['name']
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
    const formattedUserId = userId.includes('google-oauth2|') 
        ? userId 
        : `google-oauth2|${userId}`;
        
    console.log('Buscando reservas con userId formateado:', formattedUserId);
    
    try {
        const reservations = await Reservation.findAll({
            where: { 
                userId: formattedUserId
            },
            attributes: ['id','roomId','checkIn', 'checkOut', 'totalPrice', 'numberOfGuests', 'amountPaid', 'status'],
            include: [
                {
                    model: Room,
                    as: 'room', // Este "as" es obligatorio por tu definición en las relaciones
                    attributes: ['id', 'status'],
                    include: [{
                        model: RoomType,
                        as: 'roomType', // También tenés "as" definido en esta relación
                        attributes: ['name']
                    }]
                },
                {
                    model: User,
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        console.log('Reservas encontradas:', reservations.length);

        // Mapea el atributo Room.id como roomId
        const formattedReservations = reservations.map((reservation) => ({
            ...reservation.toJSON(),
            roomId: reservation.room?.id || null, 
        }));

        return formattedReservations;
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
            attributes: ['id', 'checkIn', 'checkOut', 'totalPrice', 'status', 'amountPaid', 'numberOfGuests'], 
            include: [
                {
                        model: Room,
                        as: 'room',
                        attributes: ['id', 'description', 'status'],
                        include: [{
                          model: RoomType,
                          as: 'roomType',
                          attributes: ['name']
                        }]
                      },                      
                {
                    model: User,
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        if (!reservation) {
            throw new Error('Reserva no encontrada');
        }

        // Agrega roomId directamente
        const formattedReservation = {
            ...reservation.toJSON(),
            roomId: reservation.room?.id || null,
        };

        return formattedReservation;
    } catch (error) {
        console.error('Error al obtener la reserva:', error.message);
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
