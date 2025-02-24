const { MercadoPagoConfig, Preference } = require('mercadopago');
const { Reservation } = require('../../models');

// Definimos la función como una expresión de función
const createPreference = async ({ reservationId }) => {
    const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
        options: { sandbox: true }
    });

    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
        throw new Error('Reserva no encontrada');
    }

    const preference = new Preference(client);
    
    const preferenceData = {
        items: [{
            id: String(reservation.id),
            title: `Reserva ${reservation.type} - ${reservation.numberOfGuests} huéspedes`,
            description: `Habitación ${reservation.roomId}`,
            unit_price: Number(reservation.totalPrice),
            quantity: 1,
            currency_id: 'ARS'
        }],
        back_urls: {
            success: `${process.env.FRONTEND_URL}/payment/success/${reservation.id}`,
            failure: `${process.env.FRONTEND_URL}/payment/failure/${reservation.id}`,
            pending: `${process.env.FRONTEND_URL}/payment/pending/${reservation.id}`
        },
        auto_return: "approved"
    };

    return await preference.create({ body: preferenceData });
};

// Exportamos directamente la función
module.exports = createPreference;
