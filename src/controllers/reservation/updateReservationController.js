const { Reservation } = require('../../models');

const updateReservationController = async (id, data) => {
  const reservation = await Reservation.findOne({
    where: { id: id }
  });

  if (!reservation) {
    throw new Error(`No se encontró la reserva ${id}`);
  }

  const updated = await reservation.update({
    ...data,
    numberOfGuests: Number(data.numberOfGuests)
  });

  return updated;
};

module.exports = updateReservationController;
