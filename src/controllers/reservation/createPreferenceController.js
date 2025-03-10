const { MercadoPagoConfig, Preference } = require('mercadopago');
const { Reservation } = require('../../models');

const createPreference = async ({ reservationId }) => {
    const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN
    });

    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
        throw new Error('Reserva no encontrada');
    }

    const preference = new Preference(client);
    
    const notification_url = "https://ddfe-38-7-55-3.ngrok-free.app/api/webhooks/mercadopago";
    //const notification_url = "https://[new-ngrok-subdomain].ngrok-free.app/api/webhooks/mercadopago";


    console.log('URL de notificación configurada:', notification_url);
    const preferenceData = {
        items: [{
            id: String(reservation.id),
            title: `Reserva Aremar`,
            description: `Reserva habitación ${reservation.roomId}`,
            unit_price: Number(reservation.totalPrice),
            quantity: 1,
            currency_id: 'ARS'
        }],
        back_urls: {
            success: "http://localhost:5173/payment/success",
            failure: "http://localhost:5173/payment/failure",
            pending: "http://localhost:5173/payment/pending"
        },
        notification_url: notification_url,
        auto_return: "approved",
        external_reference: String(reservation.id)
    };

    console.log('Creando preferencia con datos:', preferenceData);
    
    const response = await preference.create({ body: preferenceData });
    console.log('Respuesta de MercadoPago:', response);
    
    return response;
};

module.exports = createPreference;
