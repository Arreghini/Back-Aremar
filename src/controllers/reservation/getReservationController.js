const { Reservation, Room, User } = require('../../models')

// Controlador para obtener todas las reservas
const getAllReservationController = async () => {
    try {
        const reservations = await Reservation.findAll({
            attributes: ['id', 'checkIn', 'checkOut', 'status'],
            include: [
                {
                    model: Room,
                    attributes: ['id', 'name', 'status'], // Atributos relevantes de Room
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
    try {
        const reservations = await Reservation.findAll({
            where: { userId },
            attributes: ['id', 'checkIn', 'checkOut', 'status'],
            include: [
                {
                    model: Room,
                    attributes: ['id', 'name', 'status'], // Atributos relevantes de Room
                },
                {
                    model: User,
                    attributes: ['id', 'name', 'email'], // Atributos relevantes de User
                },
            ],
        });
        return reservations;
    } catch (error) {
        console.error('Error al obtener reservas del usuario:', error.message);
        throw new Error('Hubo un problema al obtener las reservas del usuario. Inténtelo nuevamente más tarde.');
    }
};

// Controlador para obtener una reserva por su ID
const getReservationByIdController = async (reservationId) => {
    try {
        const reservation = await Reservation.findOne({
            where: { id: reservationId },
            attributes: ['id', 'checkIn', 'checkOut', 'status'],
            include: [
                {
                    model: Room,
                    attributes: ['id', 'name', 'status'], // Atributos relevantes de Room
                },
                {
                    model: User,
                    attributes: ['id', 'name', 'email'], // Atributos relevantes de User
                },
            ],
        });
        if (!reservation) {
            throw new Error(`La reserva con ID ${reservationId} no existe.`);
        }
        return reservation;
    } catch (error) {
        console.error('Error al obtener la reserva:', error.message);
        throw new Error('Hubo un problema al obtener la reserva. Inténtelo nuevamente más tarde.');
    }
};

// Exportar los controladores
const getReservationController = {
    getAllReservationController,
    getReservationByUserIdController,
    getReservationByIdController,
};

module.exports = getReservationController;
