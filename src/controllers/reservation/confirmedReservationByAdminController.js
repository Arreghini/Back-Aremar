const { Reservation } = require("../../models");

const updateReservationByAdminController = async (reservationId, updatedData) => {
  try {
    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
      throw new Error("Reserva no encontrada");
    }

    // Actualizar los campos permitidos
    Object.assign(reservation, updatedData);
    reservation.status = "confirmed"; // Cambiar el estado a confirmado

    // Guardar los cambios
    const updatedReservation = await reservation.save();

    return {
      success: true,
      data: updatedReservation,
      message: "Reserva actualizada exitosamente",
    };
  } catch (error) {
    console.error("Error al actualizar la reserva:", error.message);
    throw new Error(`Error al actualizar la reserva: ${error.message}`);
  }
};
module.exports = updateReservationByAdminController;