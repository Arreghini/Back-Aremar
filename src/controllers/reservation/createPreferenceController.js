const { MercadoPagoConfig, Preference } = require('mercadopago');
const { Reservation } = require('../../models');

// Definimos la función como una expresión de función
const createPreference = async ({ reservationId }) => {
    const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
    });

    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
        throw new Error('Reserva no encontrada');
    }

    const preference = new Preference(client);
    
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
        auto_return: "approved",
        external_reference: String(reservation.id)
    };
            
    return await preference.create({ body: preferenceData });
};

// Exportamos directamente la función
module.exports = createPreference;
