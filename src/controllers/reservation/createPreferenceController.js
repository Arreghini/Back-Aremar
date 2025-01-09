const mercadopago = require('mercadopago');
mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

const createPreferenceController = async (reservationId, amount, currency) => {
    const preference = {
      items: [{
        title: `Reserva #${reservationId}`,
        unit_price: amount,
        quantity: 1,
        currency_id: currency
      }],
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment/success`,
        failure: `${process.env.FRONTEND_URL}/payment/failure`
      },
      auto_return: "approved"
    };
  
    return await mercadopago.preferences.create(preference);
  };
  
  module.exports = createPreferenceController;
  