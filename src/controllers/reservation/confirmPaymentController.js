const { Reservation, Room } = require('../../models/index');

const confirmPayment = async (reservationId) => {
  try {
    console.log('Buscando reserva con ID:', reservationId);
    
    const reservation = await Reservation.findByPk(reservationId);
    
    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }
    
    console.log('Estado actual de la reserva:', reservation.status);
    
    if (reservation.status === 'confirmed') {
      return {
        status: 'already_confirmed',
        message: 'La reserva ya fue confirmada anteriormente',
        reservation
      };
    }

    if (reservation.status === 'cancelled') {
      throw new Error('No se puede confirmar una reserva cancelada');
    }

    // Cambiar estado de la reserva a confirmado
    reservation.status = 'confirmed';
    await reservation.save();
    console.log('Reserva confirmada exitosamente');

    // Actualizar estado de la habitación
    const room = await Room.findByPk(reservation.roomId);
    if (room) {
      room.status = 'unavailable';
      await room.save();
      console.log('Habitación actualizada a unavailable');
    }

    return {
      status: 'confirmed',
      message: 'Reserva confirmada exitosamente',
      reservation
    };
  } catch (error) {
    console.error('Error detallado:', error);
    throw new Error(error.message);
  }
};

module.exports = confirmPayment;
