const createReservationController = require('../../controllers/reservation/createReservationController');

const createReservationHandler = async (req, res) => {
  try {
    const reservationData = req.body;
    const newReservation = await createReservationController(reservationData);
    res.status(201).json(newReservation);
  } catch (error) {
    console.error('Error al crear la reserva:', error.message);
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
};

module.exports = createReservationHandler;