const axios = require('axios');
const { Reservation } = require('../../models');

const webhookController = async (req, res) => {
    try {
        console.log('Iniciando procesamiento de notificación de MercadoPago');
        const { topic, resource } = req.body;
        
        // Obtener token de las variables de entorno
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        console.log('Token de MercadoPago:', accessToken ? 'Configurado correctamente' : 'No encontrado');

        if (topic === 'payment') {
            const paymentId = resource;
            console.log('Procesando pago con ID:', paymentId);
            
            // Consultar estado del pago en MercadoPago
            const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Información del pago:', {
                estado: response.data.status,
                referencia: response.data.external_reference
            });

            // Si el pago está aprobado, actualizar la reserva
            if (response.data.status === 'approved') {
                const reservationId = response.data.external_reference;
                console.log('Actualizando estado de reserva:', reservationId);

                const [filasActualizadas] = await Reservation.update(
                    { status: 'confirmed' },
                    { where: { id: reservationId } }
                );

                console.log('Actualización completada:', {
                    reservaId: reservationId,
                    filasModificadas: filasActualizadas
                });
            }
        }

        res.status(200).json({ exito: true });
    } catch (error) {
        console.error('Error en procesamiento:', {
            mensaje: error.message,
            detalles: error.response?.data
        });
        res.status(200).json({ exito: false });
    }
};

module.exports = webhookController;
