const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

const createPreferenceController = async (reservationId, amount, currency) => {
    try {
        const preference = new Preference(client);
        const preferenceData = {
            items: [{
                title: `Reserva #${reservationId}`,
                unit_price: Number(amount),
                quantity: 1,
                currency_id: currency
            }],
            back_urls: {
                success: `${process.env.FRONTEND_URL}/payment/success`,
                failure: `${process.env.FRONTEND_URL}/payment/failure`
            },
            auto_return: "approved"
        };
        
        const result = await preference.create({ body: preferenceData });
        return result;
    } catch (error) {
        console.log("Error en MercadoPago:", error);
        throw error;
    }
};

module.exports = createPreferenceController;
