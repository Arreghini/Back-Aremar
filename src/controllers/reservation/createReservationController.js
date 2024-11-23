const { Room, Reservation } = require('../../models');
const { getAvailableRoomsController } = require('../room/getRoomController');

const createReservationController = async (reservationData) => {
  try {
    const availableRooms = await Room.findAll({
      where: {
        roomTypeId: reservationData.datosCompletos.roomTypeId,
        status: 'available'
      },
      include: ['RoomType']
    });

    if (!availableRooms || availableRooms.length === 0) {
      throw new Error('No hay habitaciones disponibles del tipo solicitado');
    }

    // Cálculo mejorado del precio total
    const checkIn = new Date(reservationData.checkIn);
    const checkOut = new Date(reservationData.checkOut);
    const numberOfDays = Math.max(1, Math.floor((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    const pricePerNight = parseFloat(availableRooms[0].price);
    const totalPrice = Math.round(numberOfDays * pricePerNight);

    const newReservation = await Reservation.create({
      roomId: availableRooms[0].id,
      checkIn: reservationData.checkIn,
      checkOut: reservationData.checkOut,
      userId: reservationData.datosCompletos.userId,
      numberOfGuests: reservationData.datosCompletos.guestsNumber,
      totalPrice: totalPrice || 0, // Aseguramos un valor numérico válido
      status: 'pending'
    });

    return newReservation;
  } catch (error) {
    throw error;
  }
};

module.exports = createReservationController;
