const createPreference = require('../../controllers/reservation/createPreferenceController');

const createPreferenceHandler = async (req, res) => {
    try {
        const reservationId = parseInt(req.params.reservationId);
        console.log('Procesando pago para reserva ID:', reservationId);
        
        const preference = await createPreference({ reservationId });
        
        return res.status(200).json({
            success: true,
            preferenceId: preference.id,
            init_point: preference.init_point,
            sandbox_init_point: preference.sandbox_init_point
        });
    } catch (error) {
        console.error('Error en createPreferenceHandler:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al crear preferencia de pago',
            message: error.message
        });
    }
};

module.exports = createPreferenceHandler;
