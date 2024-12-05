const updateReservationController = require('../../controllers/reservation/updateReservationController');

const updateReservationHandler = async (req, res) => {
  try {
    const reservationId = Number(req.url.match(/\/(\d+)$/)[1]);
    const updatedData = req.body.body;
    
    console.log('Datos recibidos del front:', {
      id: reservationId,
      datos: updatedData
    });

    const updatedReservation = await updateReservationController(reservationId, updatedData);
    return res.status(200).json(updatedReservation);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = updateReservationHandler;
