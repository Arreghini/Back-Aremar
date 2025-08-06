const { processRefund } = require('../refundService');
const axios = require('axios');
const { Refund: RefundModel } = require('../../models');

jest.mock('axios');
jest.mock('../../models', () => ({
  Refund: {
    create: jest.fn(),
  },
}));

describe('processRefund', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MERCADOPAGO_ACCESS_TOKEN = 'test_token';
  });

  it('debería lanzar error si paymentId es nulo', async () => {
    const result = await processRefund({ amount: 100, reservationId: 'res1' });
    expect(result.success).toBe(false);
    expect(result.mensaje).toMatch(/paymentId/);
  });

  it('debería lanzar error si el monto no es válido', async () => {
    const result = await processRefund({ paymentId: '123', amount: 0 });
    expect(result.success).toBe(false);
    expect(result.mensaje).toMatch(/monto/);
  });

  it('debería procesar correctamente el reembolso', async () => {
    axios.post.mockResolvedValue({
      status: 201,
      data: {
        id: 'refund123',
        status: 'approved',
      },
    });

    const result = await processRefund({
      paymentId: '123',
      amount: 100,
      reservationId: 'res123',
    });

    expect(result.success).toBe(true);
    expect(result.mensaje).toMatch(/procesado correctamente/);
    expect(RefundModel.create).toHaveBeenCalledWith({
      reservationId: 'res123',
      amount: '100.00',
      reason: 'Reembolso parcial',
      paymentId: '123',
      mercadopagoRefundId: 'refund123',
    });
  });

  it('debería manejar errores de la API de MercadoPago', async () => {
    axios.post.mockRejectedValue({
      message: 'Request failed',
      response: {
        status: 400,
        data: { error: 'Bad Request' },
        headers: {},
      },
    });

    const result = await processRefund({
      paymentId: '123',
      amount: 100,
      reservationId: 'res123',
    });

    expect(result.success).toBe(false);
    expect(result.mensaje).toBe('Request failed');
  });
});
