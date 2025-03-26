const createReservationController = require('../../controllers/reservation/createReservationController');
const createReservationHandler = async (req, res) => {
  console.log('Headers recibidos:', req.headers);
  console.log('Body completo:', req.body); 
  try {
    const reservationData = req.body;
    console.log('Datos de la reserva recibidos:', reservationData);

    const newReservation = await createReservationController(reservationData);
    console.log('Reserva creada con éxito:', newReservation);

    res.status(201).json({
      success: true,
      data: newReservation,
    });
  } catch (error) {
    console.error('Error al crear la reserva:', error.message);
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
};
module.exports = createReservationHandler;
