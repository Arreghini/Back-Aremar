const { Reservation } = require("../../models");

const confirmedReservationByAdminController = async (reservationId) => {
  try {
    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
      throw new Error("Reserva no encontrada");
    }

    if (reservation.status === 'confirmed') {
      throw new Error("La reserva ya está confirmada");
    }

    reservation.status = 'confirmed';
    const updatedReservation = await reservation.save();

    return {
      success: true,
      data: updatedReservation,
      message: 'Reserva confirmada exitosamente'
    };
  } catch (error) {
    throw new Error(`Error al confirmar la reserva: ${error.message}`);
  }
};

module.exports = confirmedReservationByAdminController;
