const axios = require('axios');
const { Refund: RefundModel } = require('../models');

const processRefund = async ({
  reservationId,
  paymentId,
  amount,
  reason = 'Reembolso parcial',
}) => {
  try {
    // Validar paymentId
    if (!paymentId) {
      throw new Error(
        'No se puede procesar el reembolso porque el paymentId es nulo o no está disponible.'
      );
    }

    // Validar monto
    if (!amount || amount <= 0) {
      throw new Error('El monto del reembolso debe ser un valor positivo.');
    }

    // Usar el mismo token que funciona para las preferencias
    const accessToken =
      process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;

    console.log(
      'Intentando reembolso con token:',
      accessToken.substring(0, 10) + '...'
    );
    console.log('Para el pago ID:', paymentId);
    console.log('Monto a reembolsar:', amount);

    // Reembolso en MercadoPago (solicitud HTTP directa)
    const refundResponse = await axios.post(
      `https://api.mercadopago.com/v1/payments/${paymentId}/refunds`,
      { amount },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 segundos de timeout
      }
    );

    console.log('Respuesta de MercadoPago:', refundResponse.status);
    console.log('Datos de respuesta:', refundResponse.data);

    // Guardar en la base de datos después de confirmar el reembolso
    await RefundModel.create({
      reservationId,
      amount: amount.toFixed(2),
      reason,
      paymentId,
      mercadopagoRefundId: refundResponse.data.id,
    });

    return {
      success: true,
      mensaje: `Reembolso de ${amount.toFixed(2)} procesado correctamente.`,
      data: refundResponse.data,
    };
  } catch (error) {
    console.error('Error en proceso de reembolso:', error.message);

    // Mejorar el registro de errores para depuración
    if (error.response) {
      console.error('Detalles del error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    }

    return {
      success: false,
      mensaje: 'Hubo un error al procesar el reembolso.',
      error: error.message,
    };
  }
};

module.exports = { processRefund };
