const axios = require('axios');
const { Refund: RefundModel } = require('../models');

const processRefund = async ({ reservationId, paymentId, amount, reason = 'Reembolso parcial' }) => {
  try {
    // Validar paymentId
    if (!paymentId) {
      throw new Error('No se puede procesar el reembolso porque el paymentId es nulo o no está disponible.');
    }

    // Guardar en la base de datos
    await RefundModel.create({
      reservationId,
      amount: amount.toFixed(2),
      reason,
    });

    // Reembolso en MercadoPago (solicitud HTTP manual)
    const refundResponse = await axios.post(
      `https://api.mercadopago.com/v1/payments/${paymentId}/refunds`,
      { amount },
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );

    console.log('Reembolso procesado:', refundResponse.data);

    return {
      success: true,
      mensaje: `Reembolso de $${amount.toFixed(2)} procesado correctamente.`,
      data: refundResponse.data,
    };
  } catch (error) {
    console.error('Error en proceso de reembolso:', error.message);
    return {
      success: false,
      mensaje: 'Hubo un error al procesar el reembolso.',
      error: error.message,
    };
  }
};

module.exports = { processRefund };
