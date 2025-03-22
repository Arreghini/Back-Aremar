const { MercadoPagoConfig, Preference } = require("mercadopago");
const { Reservation } = require("../../models");

const createPreference = async (req, res) => {
    try {
      const { reservationId } = req.body;
  
      const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN,
      });
  
      const reservation = await Reservation.findByPk(reservationId);
      if (!reservation) {
        return res.status(404).json({ error: "Reserva no encontrada" });
      }
      
      console.log('Precio total de la reserva:', reservation.totalPrice); // Agregar este log
      
      if (!reservation.totalPrice) {
        throw new Error('El precio total de la reserva no está definido.');
      }
      const preference = new Preference(client);
  
      const preferenceData = {
        items: [
          {
            id: String(reservation.id),
            title: `Reserva Aremar`,
            description: `Reserva habitación ${reservation.roomId}`,
            unit_price: Number(reservation.totalPrice) || 0,
            quantity: 1,
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success: `${process.env.NGROK_URL}/success`,
          failure: `${process.env.NGROK_URL}/failure`,
          pending: `${process.env.NGROK_URL}/pending`,
        },
        notification_url: `${process.env.NGROK_URL}/api/webhooks/mercadopago`,
        auto_return: "approved",
        external_reference: String(reservation.id),
        payer: {
          email: "test_user_1558411578@testuser.com",
          identification: {
            type: "DNI",
            number: "12345678",
          },
        },
      };
      const response = await preference.create({ body: preferenceData });
      return res.json({ preferenceId: response.id });
      
    } catch (error) {
      console.error("Error al crear preferencia de pago:", error);
      return res.status(500).json({ error: error.message });
    }
  };
  

module.exports = createPreference;
