const { Room, Reservation } = require('../../models');
const { getAvailableRoomsController } = require('../room/getRoomController');

const createReservationController = async (reservationData) => {
  try {
    const room = await Room.findOne({
      where: {
        id: reservationData.roomId
      },
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
    
    // Establecemos un precio por defecto si no existe
    const pricePerNight = room.RoomType?.price || 100; // Precio por defecto de 100
    const totalPrice = numberOfDays * pricePerNight;

    const newReservation = await Reservation.create({
      roomId: room.id,
      checkIn: reservationData.checkIn,
      checkOut: reservationData.checkOut,
      userId: reservationData.datosCompletos.userId,
      numberOfGuests: reservationData.numberOfGuests,
      totalPrice: Math.round(totalPrice), // Aseguramos que sea un número entero
      status: 'pending'
    });

    return newReservation;
  } catch (error) {
    throw error;
  }
};

module.exports = createReservationController;
