const createPreference = require('../../controllers/reservation/createPreferenceController');

const createPreferenceHandler = async (req, res) => {
  try {
    console.log('📌 Se llamó a createPreferenceHandler');
    console.log('🔹 Parámetros recibidos:', req.params);
    console.log('🔹 Cuerpo de la solicitud:', req.body);

    const reservationId = parseInt(req.params.reservationId);
    if (!reservationId) {
      console.error('❌ ERROR: No se recibió reservationId o no es válido');
      return res.status(400).json({
        success: false,
        error: 'Falta el ID de la reserva o es inválido',
      });
    }

    // Modificamos el body para incluir el reservationId
    req.body = {
      ...req.body,
      reservationId: reservationId,
    };

    console.log('✅ ID de reserva válido, llamando a createPreference...');
    // Pasamos req y res directamente al controlador
    await createPreference(req, res);
  } catch (error) {
    console.error('❌ ERROR en createPreferenceHandler:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al crear preferencia de pago',
      message: error.message,
    });
  }
};

module.exports = createPreferenceHandler;
