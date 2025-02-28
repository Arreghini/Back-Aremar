const axios = require('axios');
const { Reservation } = require('../../models/Reservation');

const webhookController = async (req, res) => {
    try {
        console.log('Iniciando procesamiento de webhook');
        const { type, data } = req.body;
        console.log('Tipo de notificación:', type);
        console.log('Datos completos recibidos:', data);

        if (type === 'payment') {
            const paymentId = data.id;
            console.log('Procesando pago ID:', paymentId);

            // Obtener detalles del pago de MercadoPago
            const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
                }
            });

            console.log('Estado del pago:', response.data.status);
            console.log('Detalles completos del pago:', response.data);

            if (response.data.status === 'approved') {
                const reservationId = response.data.external_reference;
                
                // Verificar estado actual de la reserva
                const reservaPrevia = await Reservation.findByPk(reservationId);
                console.log('Estado actual de la reserva:', reservaPrevia?.status);

                // Actualizar estado
                const result = await Reservation.update(
                    { status: 'confirmed' },
                    { 
                        where: { id: reservationId },
                        returning: true
                    }
                );

                // Verificar actualización
                const reservaActualizada = await Reservation.findByPk(reservationId);
                console.log('Estado actualizado de la reserva:', reservaActualizada?.status);
                console.log('Actualización completada:', {
                    reservationId,
                    estadoAnterior: reservaPrevia?.status,
                    estadoNuevo: reservaActualizada?.status,
                    resultado: result
                });
            }
        }

        res.status(200).json({ message: 'Webhook procesado correctamente' });
    } catch (error) {
        console.error('Error en procesamiento de webhook:', {
            mensaje: error.message,
            detalles: error
        });
        res.status(500).json({ error: 'Error procesando webhook' });
    }
};

module.exports = webhookController;
