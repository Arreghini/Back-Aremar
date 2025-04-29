const axios = require("axios");
const { Reservation } = require("../../models");

const processedOrders = new Set();

async function actualizarReserva(reservationId, paymentType, totalPaid) {
  const reservation = await Reservation.findByPk(reservationId);
  if (!reservation) return;

  let nuevoMontoPagado = reservation.amountPaid || 0;
  const totalReserva = reservation.totalPrice;

  let montoAAgregar = 0;

  // 🧠 Calculamos lo que debería sumar según el tipo de pago
  switch (paymentType) {
    case "deposit":
      montoAAgregar = totalReserva * 0.5;
      break;
    case "remaining":
      montoAAgregar = totalReserva - nuevoMontoPagado;
      break;
    case "total":
      montoAAgregar = totalReserva;
      break;
    default:
      throw new Error(`Tipo de pago desconocido: ${paymentType}`);
  }

  // 🛡️ Seguridad extra: que no puedan mandar menos o más plata de lo esperado
  const tolerancia = 5; // pesos de tolerancia para redondeos o diferencias chicas

  if (Math.abs(totalPaid - montoAAgregar) > tolerancia) {
    throw new Error(`Monto pagado (${totalPaid}) no coincide con el esperado (${montoAAgregar})`);
  }

  // ✅ Sumamos el monto real pagado (totalPaid) para registrar exactamente lo pagado
  nuevoMontoPagado += totalPaid;

  const estadoReserva = nuevoMontoPagado >= totalReserva ? "confirmed" : "partial";

  await Reservation.update(
    {
      status: estadoReserva,
      mensaje: estadoReserva === "confirmed" ? "Reserva Confirmada" : "Pago Parcial Recibido",
      amountPaid: nuevoMontoPagado,
    },
    { where: { id: reservationId } }
  );
}

const webhookController = async (req, res) => {
  try {
    const { topic, resource } = req.body;
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (topic === "merchant_order") {
      const orderResponse = await axios.get(resource, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const orderData = orderResponse.data;

      if (processedOrders.has(orderData.id)) {
        return res.status(200).send("OK");
      }

      const approvedPayments = orderData.payments.filter((p) => p.status === "approved");
      const totalPaid = approvedPayments.reduce((sum, p) => sum + p.transaction_amount, 0);

      // 🚨 Parsear el external_reference (JSON)
      let reservationId;
      let paymentType;
      try {
        const referenceData = JSON.parse(orderData.external_reference);
        reservationId = referenceData.reservationId;
        paymentType = referenceData.paymentType;
      } catch (error) {
        console.error("Error al parsear external_reference:", orderData.external_reference);
        return res.status(400).send("Invalid external_reference");
      }

      console.log(`Procesando webhook para reserva ${reservationId}, tipo de pago: ${paymentType}`);

      // ✨ Actualizar con la lógica reforzada
      await actualizarReserva(reservationId, paymentType, totalPaid);

      processedOrders.add(orderData.id);
    } else {
      console.log(`Topic no manejado: ${topic}`);
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Error en procesamiento del webhook:", {
      mensaje: error.message,
      detalles: error.response?.data,
    });
    return res.status(200).send("OK");
  }
};

module.exports = webhookController;
