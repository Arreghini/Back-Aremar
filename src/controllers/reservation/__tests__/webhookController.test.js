// __tests__/webhookController.test.js

const axios = require('axios');
const httpMocks = require('node-mocks-http');
const { Reservation } = require('../../../models');
const webhookController = require('../webhookController');

jest.mock('axios');
jest.mock('../../../models', () => ({
  Reservation: {
    findByPk: jest.fn(),
    update: jest.fn(),
  },
}));

describe('webhookController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe procesar correctamente un pago merchant_order', async () => {
    const mockRequest = httpMocks.createRequest({
      method: 'POST',
      url: '/webhook',
      body: {
        topic: 'merchant_order',
        resource: 'https://api.mercadopago.com/merchant_orders/123456',
      },
    });

    const mockResponse = httpMocks.createResponse();

    axios.get.mockResolvedValue({
      data: {
        id: 123456,
        payments: [
          {
            status: 'approved',
            transaction_amount: 500,
            id: 'pay_abc123',
          },
        ],
        external_reference: JSON.stringify({
          reservationId: 1,
          paymentType: 'total',
        }),
      },
    });

    Reservation.findByPk.mockResolvedValue({
      id: 1,
      amountPaid: 0,
      totalPrice: 500,
    });

    Reservation.update.mockResolvedValue([1]);

    await webhookController(mockRequest, mockResponse);

    expect(axios.get).toHaveBeenCalledWith('https://api.mercadopago.com/merchant_orders/123456', {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    });

    expect(Reservation.findByPk).toHaveBeenCalledWith(1);
    expect(Reservation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentId: 'pay_abc123',
        status: 'confirmed',
        mensaje: 'Pago total recibido',
        amountPaid: 500,
      }),
      { where: { id: 1 } }
    );

    expect(mockResponse._getStatusCode()).toBe(200);
    expect(mockResponse._getData()).toBe('OK');
  });

  test('debe manejar errores en el webhook', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/webhook',
      body: {
        topic: 'merchant_order',
        resource: 'https://api.mercadopago.com/merchant_orders/invalid',
      },
    });

    const res = httpMocks.createResponse();

    axios.get.mockRejectedValue(new Error('Network error'));

    await webhookController(req, res);

    expect(res._getStatusCode()).toBe(200); // sigue devolviendo 200
    expect(res._getData()).toBe('OK');
  });
});
describe('axios instance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe manejar timeout en la solicitud axios', async () => {
    const mockRequest = httpMocks.createRequest({
      method: 'POST',
      url: '/webhook',
      body: {
        topic: 'merchant_order',
        resource: 'https://api.mercadopago.com/merchant_orders/123456',
      },
    });

    const mockResponse = httpMocks.createResponse();

    axios.get.mockRejectedValue({ code: 'ECONNABORTED' });

    await webhookController(mockRequest, mockResponse);

    expect(mockResponse._getStatusCode()).toBe(200);
    expect(mockResponse._getData()).toBe('OK');
  });

  test('debe manejar error 404 en la solicitud axios', async () => {
    const mockRequest = httpMocks.createRequest({
      method: 'POST',
      url: '/webhook',
      body: {
        topic: 'merchant_order',
        resource: 'https://api.mercadopago.com/merchant_orders/123456',
      },
    });

    const mockResponse = httpMocks.createResponse();

    axios.get.mockRejectedValue({ response: { status: 404 } });

    await webhookController(mockRequest, mockResponse);

    expect(mockResponse._getStatusCode()).toBe(200);
    expect(mockResponse._getData()).toBe('OK');
  });

  test('debe manejar error de autorización en la solicitud axios', async () => {
    const mockRequest = httpMocks.createRequest({
      method: 'POST',
      url: '/webhook',
      body: {
        topic: 'merchant_order',
        resource: 'https://api.mercadopago.com/merchant_orders/123456',
      },
    });

    const mockResponse = httpMocks.createResponse();

    axios.get.mockRejectedValue({ response: { status: 401 } });

    await webhookController(mockRequest, mockResponse);

    expect(mockResponse._getStatusCode()).toBe(200);
    expect(mockResponse._getData()).toBe('OK');
  });
});
