const { Reservation } = require('../../models');

const updateReservationController = async (id, data) => {
  try {
    const reservation = await Reservation.findOne({
      where: { id: id }
    });

    if (!reservation) {
      throw new Error(`No se encontró la reserva con id ${id}`);
    }

    const updated = await reservation.update({
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      numberOfGuests: Number(data.numberOfGuests),
      roomId: data.roomId,
      status: data.status.toLowerCase()
    });

    return {
      success: true,
      mensaje: "Reserva actualizada exitosamente",
      data: updated
    };
    
  } catch (error) {
    throw new Error(`Error al actualizar la reserva: ${error.message}`);
  }
};

module.exports = updateReservationController;
