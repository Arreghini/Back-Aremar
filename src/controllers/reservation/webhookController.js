const axios = require('axios');
const { Reservation } = require('../../models');

const processedPayments = new Set();

const webhookController = async (req, res) => {
    try {
        console.log('Iniciando procesamiento de notificación de MercadoPago');
        const { topic, resource } = req.body;

        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        console.log('Token de MercadoPago:', accessToken ? 'Configurado correctamente' : 'No encontrado');

        if (topic === 'payment') {
            // ... (Este código se mantiene igual)
        } else if (topic === 'merchant_order') {
            console.log('Recibida notificación de merchant_order:', resource);
            const merchantOrderId = resource.split('/').pop();

            const merchantOrderResponse = await axios.get(`https://api.mercadopago.com/merchant_orders/${merchantOrderId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            const payments = merchantOrderResponse.data.payments;

            if (payments && payments.length > 0) {
                const paymentId = payments[0].id; // Asumiendo un solo pago por orden

                // Idempotency check
                if (processedPayments.has(paymentId)) {
                    console.log(`Payment ${paymentId} already processed. Skipping.`);
                    return res.status(200).send('OK');
                }


                const paymentResponse = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
                });

                console.log('Información del pago desde merchant_order:', paymentResponse.data);

                if (paymentResponse.data.status === 'approved') {
                    const reservationId = paymentResponse.data.external_reference;
                    await actualizarReserva(reservationId);
                    processedPayments.add(paymentId);
                }
            } else {
                console.log('No se encontraron pagos asociados a la orden.');
            }
        }

        return res.status(200).send('OK');

    } catch (error) {
        console.error('Error en procesamiento:', {
            mensaje: error.message,
            detalles: error.response?.data
        });
        return res.status(200).send('OK'); // Mantén el 200 para evitar reintentos de MercadoPago
    }
};
async function actualizarReserva(reservationId) {
    console.log('Actualizando estado de reserva:', reservationId);

    const [filasActualizadas] = await Reservation.update(
        {
            status: 'confirmed',
            mensaje: 'Reserva Confirmada'
        },
        { where: { id: reservationId } }
    );

    console.log('Actualización completada:', {
        reservaId: reservationId,
        filasModificadas: filasActualizadas,
        mensaje: 'Reserva Confirmada'
    });
}


module.exports = webhookController;
