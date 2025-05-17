const updateReservationController = require('../../controllers/reservation/updateReservationController');

const updateReservationHandler = async (req, res) => {
  try {
    const reservationId = Number(req.params.reservationId);
    const updatedData = req.body;

    // Validar ID
    console.log('req.params.reservationId recibido por el handler:', reservationId);

    if (isNaN(reservationId)) {
      return res.status(400).json({ error: 'ID de reserva inválido' });
    }

    console.log('Datos recibidos del front:', {
      id: reservationId,
      datos: updatedData,
    });

    // Llamar al controlador para actualizar la reserva
    const updatedReservation = await updateReservationController(reservationId, updatedData);

    if (!updatedReservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Verificar si se procesó un reembolso
    if (updatedReservation.mensaje.includes('reembolso')) {
      console.log('Reembolso procesado:', updatedReservation.mensaje);
    }

    // Responder con la reserva actualizada y el mensaje
    return res.status(200).json(updatedReservation);
  } catch (error) {
    console.error('Error en updateReservationHandler:', error.message);

    // Manejar errores relacionados con reembolsos
    if (error.message.includes('reembolso')) {
      return res.status(400).json({ error: `Error al procesar el reembolso: ${error.message}` });
    }

    return res.status(500).json({ error: error.message });
  }
};

module.exports = updateReservationHandler;