const { Room, Reservation, RoomType } = require('../../models');

const createReservationController = async (reservationData) => {
  try {
    const room = await Room.findOne({
      where: {
        id: reservationData.roomId
      },
      include: {
        model: RoomType,
        attributes: ['name', 'price']
      }
    });

    console.log('Room encontrada:', JSON.stringify(room, null, 2));
    console.log('RoomType:', room.RoomType);

    if (!room) {
      throw new Error('Habitación no encontrada');
    }

    const availableRooms = await Room.findAll({
      where: {
        id: reservationData.roomId,
        status: 'available'
      },
      include: {
        model: RoomType,
        attributes: ['name']
      }
    });

    if (!availableRooms || availableRooms.length === 0) {
      throw new Error('La habitación seleccionada no está disponible');
    }

    const checkIn = new Date(reservationData.checkIn);
    const checkOut = new Date(reservationData.checkOut);
    const numberOfDays = Math.max(1, Math.floor((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

    const pricePerNight = room.RoomType?.price || 100;
    const totalPrice = numberOfDays * pricePerNight;

    // Corregimos esta línea
    const newReservation = await Reservation.create({
      roomId: room.id,
      type: room.RoomType?.name || 'Desconocido', 
      checkIn: reservationData.checkIn,
      checkOut: reservationData.checkOut,
      userId: reservationData.datosCompletos?.userId || null,
      numberOfGuests: reservationData.numberOfGuests,
      totalPrice: Math.round(totalPrice),
      status: 'pending'
    });

    return newReservation;
  } catch (error) {
    console.error('Error detallado:', error);
    throw new Error(error.message || 'Error al crear la reserva');
  }
};

module.exports = createReservationController;
