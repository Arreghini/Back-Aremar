const { Reservation, Room } = require('../models');

exports.createReservation = async (req, res) => {
  try {
    const { userId, roomId, checkInDate, checkOutDate, guests, totalPrice } = req.body;
    
    // Crear la reserva
    const reservation = await Reservation.create({
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      status: 'pending',
    });

    // Actualizar el estado de la habitación a 'unavailable'
    await Room.update({ status: 'unavailable' }, { where: { id: roomId } });

    res.json(reservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).send('Error creating reservation');
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    // Encontrar la reserva y obtener roomId
    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).send('Reservation not found');
    }

    const roomId = reservation.roomId;

    // Eliminar la reserva
    await reservation.destroy();

    // Actualizar el estado de la habitación a 'available'
    await Room.update({ status: 'available' }, { where: { id: roomId } });

    res.json({ message: 'Reservation deleted' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).send('Error deleting reservation');
  }
};
