const axios = require('axios');
const { Reservation } = require('../../models/Reservation');

const webhookController = async (req, res) => {
    try {
        const { type, data } = req.body;
        console.log('Webhook recibido:', { type, data });

        if (type === 'payment') {
            const paymentId = data.id;
            const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: { 
                    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            const payment = response.data;
            if (payment.status === 'approved') {
                await Reservation.update(
                    { status: 'paid' },
                    { where: { id: payment.external_reference } }
                );
            }
        }

        res.status(200).json({ message: 'Webhook procesado correctamente' });
    } catch (error) {
        console.error('Error en webhook:', error);
        res.status(500).json({ error: 'Error procesando webhook' });
    }
};

module.exports = webhookController;
