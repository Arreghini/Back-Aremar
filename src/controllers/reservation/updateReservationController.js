const { Reservation } = require('../../models');

const updateReservationController = async (reservationId, reservationData) => {
  console.log('ID recibido:', reservationId);
  console.log('Datos recibidos:', reservationData);

  const reservation = await Reservation.findOne({
    where: { id: parseInt(reservationId) }
  });

  if (!reservation) {
    console.log('No se encontró la reserva con ID:', reservationId);
    throw new Error('Reserva no encontrada');
  }

  const dataToUpdate = reservationData.body || reservationData;

  const updatedReservation = await reservation.update({
    checkIn: dataToUpdate.checkIn,
    checkOut: dataToUpdate.checkOut,
    numberOfGuests: dataToUpdate.numberOfGuests,
    roomId: dataToUpdate.roomId,
    status: dataToUpdate.status
  });

  return updatedReservation;
};

module.exports = updateReservationController;
