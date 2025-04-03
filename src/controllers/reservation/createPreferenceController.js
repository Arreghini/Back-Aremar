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

    console.log("Precio total de la reserva:", reservation.totalPrice);

    if (!reservation.totalPrice) {
      throw new Error("El precio total de la reserva no está definido.");
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
        success: `${process.env.CLOUDFLARED_URL}/api/payment/redirect?status=approved&reservationId=${reservation.id}`,
        failure: `${process.env.CLOUDFLARED_URL}/api/payment/redirect?status=failure&reservationId=${reservation.id}`,
        pending: `${process.env.CLOUDFLARED_URL}/api/payment/redirect?status=pending&reservationId=${reservation.id}`,
      },
      auto_return: "approved", // Redirige automáticamente al success si el pago es aprobado
      external_reference: String(reservation.id), // ID de la reserva para identificarla en el webhook
      notification_url: `${process.env.CLOUDFLARED_URL}/api/webhooks/mercadopago`, // URL del webhook
      payer: {
        email: "test_user_2026113555@testuser.com",
        identification: {
          type: "DNI",
          number: "12345678",
        },
      },
    };
    console.log("Back URLs:", preferenceData.back_urls);
    console.log("Webhook URL:", preferenceData.notification_url);

    const response = await preference.create({ body: preferenceData });
    return res.json({ preferenceId: response.id });

  } catch (error) {
    console.error("Error al crear preferencia de pago:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = createPreference;