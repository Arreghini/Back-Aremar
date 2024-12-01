const { Room, Reservation } = require('../../models');
const { getAvailableRoomsController } = require('../room/getRoomController');

const createReservationController = async (reservationData) => {
  try {
    // Primero obtenemos la habitación para saber su tipo
    const room = await Room.findByPk(reservationData.roomId, {
      include: ['RoomType']
    });

    if (!room) {
      throw new Error('Habitación no encontrada');
    }

    const availableRooms = await Room.findAll({
      where: {
        id: reservationData.roomId,
        status: 'available'
      },
      include: ['RoomType']
    });

    if (!availableRooms || availableRooms.length === 0) {
      throw new Error('La habitación seleccionada no está disponible');
    }

    const checkIn = new Date(reservationData.checkIn);
    const checkOut = new Date(reservationData.checkOut);
    const numberOfDays = Math.max(1, Math.floor((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    const pricePerNight = parseFloat(availableRooms[0].price);
    const totalPrice = Math.round(numberOfDays * pricePerNight);

    const newReservation = await Reservation.create({
      roomId: reservationData.roomId,
      checkIn: reservationData.checkIn,
      checkOut: reservationData.checkOut,
      userId: reservationData.datosCompletos.userId,
      numberOfGuests: reservationData.datosCompletos.numberOfGuests,
      totalPrice,
      status: 'pending'
    });

    return newReservation;
  } catch (error) {
    throw error;
  }
};


module.exports = createReservationController;
