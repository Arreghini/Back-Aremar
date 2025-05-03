const { Reservation, Room } = require('../../models');

const updateReservationController = async (id, data) => {
  console.log('Datos recibidos en el backend:', data);
  try {
    if (!data.roomId) {
      throw new Error('El campo roomId es obligatorio.');
    }

    // Verificar que la habitación exista
    const room = await Room.findOne({ where: { id: data.roomId } });
    if (!room) {
      throw new Error(`No se encontró la habitación con id ${data.roomId}`);
    }

    // Buscar la reserva existente
    const reservation = await Reservation.findOne({
      where: { id: id },
    });

    if (!reservation) {
      throw new Error(`No se encontró la reserva con id ${id}`);
    }

    // Verificar disponibilidad de la habitación
    const overlappingReservations = await Reservation.findAll({
      where: {
        roomId: data.roomId,
        id: { $ne: id },
        checkIn: { $lt: new Date(data.checkOut) },
        checkOut: { $gt: new Date(data.checkIn) },
      },
    });

    if (overlappingReservations.length > 0) {
      throw new Error('La habitación no está disponible para las nuevas fechas.');
    }

    // Recalcular el precio
    const checkInDate = new Date(data.checkIn);
    const checkOutDate = new Date(data.checkOut);
    const days = Math.max((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24), 0);
    const totalPrice = days * room.price;

    // Asegúrate de que los datos sean del tipo correcto
    const updated = await reservation.update({
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      numberOfGuests: parseInt(data.numberOfGuests, 10), // Asegúrate de que sea un número
      roomId: data.roomId,
      status: data.status.toLowerCase(),
      totalPrice: totalPrice, // Asegúrate de que sea un número
    });

    return {
      success: true,
      mensaje: 'Reserva actualizada exitosamente',
      data: updated,
    };
  } catch (error) {
    console.error('Error al actualizar la reserva:', error.message);
    throw new Error(`Error al actualizar la reserva: ${error.message}`);
  }
};

module.exports = updateReservationController;