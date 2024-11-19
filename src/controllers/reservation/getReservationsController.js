const Reservation = require('../../models/reservation.js');
const Room = require('../../models/room.js');
const User = require('../../models/user.js');

// Controlador para obtener todas las reservas
const getAllReservationsController = async () => {
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
                }
            ]
        });
        return reservations;
    } catch (error) {
        console.error('Error al obtener todas las reservas:', error);
        throw new Error('Hubo un problema al obtener las reservas. Inténtelo nuevamente más tarde.');
    }
};

// Controlador para obtener reservas de un usuario por su ID
const getReservationsByUserIdController = async (userId) => {
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
                }
            ]
        });
        return reservations; // Retornar las reservas obtenidas
    } catch (error) {
        console.error('Error al obtener reservas del usuario:', error); // Log del error capturado
        throw new Error('Hubo un problema al obtener las reservas del usuario. Inténtelo nuevamente más tarde.');
    }
};
        
const getReservationByIdController = async (reservationId) => {
    try {
        const reservation = await Reservation.findByPk(reservationId, {
            include: [
                {
                    model: Room,
                    attributes: ['id', 'name', 'status'], // Atributos relevantes de Room
                },
                {
                    model: User,
                    attributes: ['id', 'name', 'email'], // Atributos relevantes de User
                }
            ]
        })
        return reservation;
    } catch (error) {
        console.error('Error al obtener la reserva:', error);
        throw new Error('Hubo un problema al obtener la reserva. Inténtelo nuevamente más tarde.');
    }   

}

const getReservationsController = {
    getAllReservationsController,
    getReservationsByUserIdController,
    getReservationByIdController
};
module.exports = getReservationsController;



