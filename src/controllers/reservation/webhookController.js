const axios = require("axios");
const { Reservation } = require("../../models");

const processedOrders = new Set();

const webhookController = async (req, res) => {
  try {
    console.log("Iniciando procesamiento de notificación de MercadoPago");
    const { topic, resource, action, data } = req.body;

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    console.log("Token de MercadoPago:", accessToken ? "Configurado correctamente" : "No encontrado");

    if (topic === "merchant_order") {
      console.log("Recibida notificación de merchant_order con resource:", resource);

      // Consultar la orden de pago
      const orderResponse = await axios.get(resource, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const orderData = orderResponse.data;
      console.log("Información de la orden:", orderData);

      // Idempotency check
      if (processedOrders.has(orderData.id)) {
        console.log(`Orden ${orderData.id} ya procesada. Omitiendo.`);
        return res.status(200).send("OK");
      }

      // Verificar si hay pagos asociados a la orden
      if (orderData.payments && orderData.payments.length > 0) {
        const payment = orderData.payments.find((p) => p.status === "approved");
        if (payment) {
          const reservationId = orderData.external_reference; 
          const amountPaid = payment.transaction_amount; // Obtén el monto pagado
          console.log("Pago aprobado. Actualizando reserva con ID:", reservationId);

          await actualizarReserva(reservationId, amountPaid); // Pasa el monto pagado
          processedOrders.add(orderData.id);
        } else {
          console.log("No se encontraron pagos aprobados en la orden.");
        }
      } else {
        console.log("No se encontraron pagos asociados a la orden. Esperando futuras notificaciones.");
      }
    } else if (topic === "payment" || action === "payment.created") {
      console.log("Recibida notificación de payment con ID:", data.id);

      // Consultar el pago
      const paymentResponse = await axios.get(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const paymentData = paymentResponse.data;
      console.log("Información del pago:", paymentData);

      if (paymentData.status === "approved") {
        const reservationId = paymentData.external_reference; // ID de la reserva
        const amountPaid = paymentData.transaction_amount; // Monto pagado
        console.log("Pago aprobado. Actualizando reserva con ID:", reservationId);

        await actualizarReserva(reservationId, amountPaid); // Pasa el monto pagado
      }
    } else {
      console.log(`Topic no manejado: ${topic}`);
      return res.status(400).send("Topic no válido");
    }

    return res.status(200).send("OK"); // Responder con 200 para evitar reintentos
  } catch (error) {
    console.error("Error en procesamiento:", {
      mensaje: error.message,
      detalles: error.response?.data,
    });
    return res.status(200).send("OK"); // Mantén el 200 para evitar reintentos de MercadoPago
  }
};

async function actualizarReserva(reservationId, amountPaid) {
  console.log("Actualizando estado de reserva:", reservationId);

  const [filasActualizadas] = await Reservation.update(
    {
      status: "confirmed",
      mensaje: "Reserva Confirmada",
      amountPaid: amountPaid, // Actualiza el campo con el monto pagado
    },
    { where: { id: reservationId } }
  );

  console.log("Actualización completada:", {
    reservaId: reservationId,
    filasModificadas: filasActualizadas,
    mensaje: "Reserva Confirmada",
    amountPaid: amountPaid,
  });
}

module.exports = webhookController;