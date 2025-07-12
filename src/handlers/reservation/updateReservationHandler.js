const updateReservationController = require('../../controllers/reservation/updateReservationController');

const updateReservationHandler = async (req, res) => {
  try {
    const reservationId = Number(req.params.reservationId);
    const updatedData = req.body;

    if (isNaN(reservationId)) {
      return res
        .status(400)
        .json({
          success: false,
          mensaje: 'ID de reserva inválido',
          data: null,
        });
    }

    console.log('Datos recibidos del front:', {
      id: reservationId,
      datos: updatedData,
    });

    const updatedReservation = await updateReservationController(
      reservationId,
      updatedData
    );

    if (!updatedReservation.success) {
      // Si el controlador devuelve success: false, responde con el mensaje y detén el proceso
      return res.status(409).json({
        success: false,
        mensaje: updatedReservation.mensaje,
        data: null,
      });
    }

    return res.status(200).json(updatedReservation);
  } catch (error) {
    console.error('Error al actualizar la reserva:', error.message);

    return res.status(400).json({
      success: false,
      mensaje: error.message,
      data: null,
    });
  }
};

module.exports = updateReservationHandler;
