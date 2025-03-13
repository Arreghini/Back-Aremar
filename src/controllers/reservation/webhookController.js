const axios = require('axios');
const { Reservation } = require('../../models');

const webhookController = async (req, res) => {
    try {
        console.log('Iniciando procesamiento de notificación de MercadoPago');
        const { topic, resource } = req.body;
        
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        console.log('Token de MercadoPago:', accessToken ? 'Configurado correctamente' : 'No encontrado');

        if (topic === 'payment') {
            const paymentId = resource;
            console.log('Procesando pago con ID:', paymentId);
            
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

            if (response.data.status === 'approved') {
                const reservationId = response.data.external_reference;
                console.log('Actualizando estado de reserva:', reservationId);

                const [filasActualizadas] = await Reservation.update(
                    { 
                        status: 'confirmed',
                        mensaje: 'Reserva Confirmada'  // Agregamos el mensaje
                    },
                    { where: { id: reservationId } }
                );

                // Emitir evento o notificación al frontend
                // Aquí puedes implementar websockets o SSE para actualización en tiempo real

                console.log('Actualización completada:', {
                    reservaId: reservationId,
                    filasModificadas: filasActualizadas,
                    mensaje: 'Reserva Confirmada'
                });
            }
        }

        res.status(200).json({ 
            exito: true,
            mensaje: response.data.status === 'approved' ? 'Reserva Confirmada' : ''
        });
    } catch (error) {
        console.error('Error en procesamiento:', {
            mensaje: error.message,
            detalles: error.response?.data
        });
        res.status(200).json({ exito: false });
    }
};

module.exports = webhookController;
