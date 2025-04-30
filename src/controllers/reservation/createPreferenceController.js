const { MercadoPagoConfig, Preference } = require("mercadopago");
const { Reservation } = require("../../models");

const createPreference = async (req, res) => {
  try {
    const { reservationId, paymentType } = req.body;

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

    let unitPrice;

    // 🧠 Decidir el precio dependiendo del tipo de pago
    switch (paymentType) {
      case "deposit":
        unitPrice = reservation.totalPrice * 0.5; // 50% como seña
        break;
      case "remaining":
        unitPrice = reservation.totalPrice - (reservation.amountPaid || 0); // saldo restante
        break;
      case "total":
        unitPrice = reservation.totalPrice; // pago total
        break;
      default:
        throw new Error(`Tipo de pago desconocido: ${paymentType}`);
    }

    // Crear la preferencia de pago con los datos correspondientes
    const preferenceData = {
      items: [
        {
          id: String(reservation.id),
          title: `Reserva Aremar`,
          description: `Reserva habitación ${reservation.roomId}`,
          unit_price: Number(unitPrice) || 0,
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
      external_reference: JSON.stringify({
        reservationId: reservation.id,
        paymentType, // Incluimos el tipo de pago
      }),
      notification_url: `${process.env.CLOUDFLARED_URL}/api/webhooks/mercadopago`, // URL del webhook
      payer: {
        email: "test_user_2026113555@testuser.com", // Ojo con este dato, normalmente vendría del usuario autenticado
        identification: {
          type: "DNI",
          number: "12345678",
        },
      },
    };

    console.log("Back URLs:", preferenceData.back_urls);
    console.log("Webhook URL:", preferenceData.notification_url);

    const response = await preference.create({ body: preferenceData });

    // Enviamos el preferenceId al cliente para procesar el pago
    return res.json({
      preferenceId: response.id,
      price: unitPrice,
      reservationId: reservation.id,
      title: `Reserva habitación ${reservation.roomId}`, 
    });      

  } catch (error) {
    console.error("Error al crear preferencia de pago:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = createPreference;
