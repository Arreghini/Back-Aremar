const axios = require('axios');
const { Reservation } = require('../../models/Reservation');

const webhookController = async (req, res) => {
    try {
        console.log('Iniciando procesamiento de webhook');
        const { action, data } = req.body;
        
        const accessToken = process.env.MP_ACCESS_TOKEN;
        if (!accessToken) {
            throw new Error('Token de acceso no configurado');
        }

        if (action === 'payment.created' || action === 'payment.updated') {
            const paymentId = data.id;
            console.log('Procesando pago ID:', paymentId);
            
            const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            console.log('Respuesta de MercadoPago:', response.data);

            if (response.data.status === 'approved') {
                const reservationId = response.data.external_reference;
                console.log('Actualizando reserva:', reservationId);
                
                const [rowsUpdated] = await Reservation.update(
                    { status: 'confirmed' },
                    { 
                        where: { id: reservationId },
                        returning: true
                    }
                );
                
                console.log(`Reserva ${reservationId} actualizada. Filas modificadas: ${rowsUpdated}`);
            }
        }

        res.status(200).send();
    } catch (error) {
        console.error('Error en webhook:', {
            mensaje: error.message,
            detalles: error.response?.data
        });
        res.status(200).send();
    }
};

module.exports = webhookController;
