const { Reservation } = require("../../models");

const updateReservationByAdminController = async (reservationId, updatedData) => {
  try {
    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
      throw new Error("Reserva no encontrada");
    }

    // Permitir la edición incluso si está confirmada
    Object.assign(reservation, updatedData);
    const updatedReservation = await reservation.save();

    return {
      success: true,
      data: updatedReservation,
      message: "Reserva actualizada exitosamente",
    };
  } catch (error) {
    throw new Error(`Error al actualizar la reserva: ${error.message}`);
  }
};

module.exports = updateReservationByAdminController;