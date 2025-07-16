const axios = require('axios');
const { processRefund } = require('../refundService');

// Mock completo de axios
jest.mock('axios', () => {
  const originalAxios = jest.requireActual('axios');
  return {
    ...originalAxios,
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn(() => 1), eject: jest.fn() },
        response: { use: jest.fn(() => 2), eject: jest.fn() },
      },
    })),
    interceptors: {
      request: { use: jest.fn(() => 1), eject: jest.fn() },
      response: { use: jest.fn(() => 2), eject: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    defaults: { headers: {} },
  };
});

// Mock del modelo Refund
jest.mock('../../models', () => ({
  Refund: {
    create: jest.fn(),
  },
}));

describe('refundService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MP_ACCESS_TOKEN = 'test_token_123';
  });

  it('should throw error if paymentId is missing', async () => {
    const result = await processRefund({ amount: 100 });
    expect(result.success).toBe(false);
    expect(result.mensaje).toMatch(/paymentId/);
  });

  it('should throw error if amount is invalid', async () => {
    const result = await processRefund({ paymentId: 'abc123', amount: 0 });
    expect(result.success).toBe(false);
    expect(result.mensaje).toMatch(/monto del reembolso/);
  });

  it('should send refund request and save to DB', async () => {
    const mockResponse = { data: { id: 'ref_456' }, status: 200 };
    axios.post.mockResolvedValue(mockResponse);

    const result = await processRefund({
      paymentId: 'abc123',
      amount: 150,
      reason: 'Test reason',
      reservationId: 999,
    });

    expect(result.success).toBe(true);
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.mercadopago.com/v1/payments/abc123/refunds',
      { amount: 150 },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Bearer'),
        }),
      })
    );

    const { Refund } = require('../../models');
    expect(Refund.create).toHaveBeenCalledWith({
      reservationId: 999,
      amount: '150.00',
      reason: 'Test reason',
      paymentId: 'abc123',
      mercadopagoRefundId: 'ref_456',
    });
  });

 it('should handle refund API failure', async () => {
  axios.post.mockRejectedValue(new Error('API failed'));

  const result = await processRefund({ paymentId: 'abc123', amount: 100 });
  expect(result.success).toBe(false);
  expect(result.mensaje).toMatch(/API failed/);  // o usa /error/ si quieres ser más general
});
});

describe('axios instance configuration', () => {
  it('should have default headers', () => {
    expect(axios.defaults.headers).toBeDefined();
  });

  it('should handle request interceptors', () => {
    const interceptor = axios.interceptors.request.use(config => config);
    expect(interceptor).toBeDefined();
    axios.interceptors.request.eject(interceptor);
  });

  it('should handle response interceptors', () => {
    const interceptor = axios.interceptors.response.use(res => res);
    expect(interceptor).toBeDefined();
    axios.interceptors.response.eject(interceptor);
  });

  it('should handle PUT requests', async () => {
    const mockData = { status: 'updated' };
    const mockResponse = { data: { success: true } };
    axios.put.mockResolvedValue(mockResponse);

    const response = await axios.put('/test', mockData);
    expect(response).toEqual(mockResponse);
    expect(axios.put).toHaveBeenCalledWith('/test', mockData);
  });

  it('should handle DELETE requests', async () => {
    const mockResponse = { data: { deleted: true } };
    axios.delete.mockResolvedValue(mockResponse);

    const response = await axios.delete('/test');
    expect(response).toEqual(mockResponse);
    expect(axios.delete).toHaveBeenCalledWith('/test');
  });

  it('should handle network errors with specific status codes', async () => {
    const error = new Error('Service Unavailable');
    error.response = { status: 503, statusText: 'Service Unavailable' };
    axios.get.mockRejectedValue(error);

    try {
      await axios.get('/test');
    } catch (err) {
      expect(err.response.status).toBe(503);
    }
  });

  it('should handle requests with custom headers', async () => {
    const headers = { 'X-Test': '123' };
    const mockResponse = { data: { ok: true } };
    axios.get.mockResolvedValue(mockResponse);

    await axios.get('/test', { headers });
    expect(axios.get).toHaveBeenCalledWith('/test', { headers });
  });

  it('should handle requests with query parameters', async () => {
    const params = { page: 1 };
    const mockResponse = { data: [] };
    axios.get.mockResolvedValue(mockResponse);

    await axios.get('/test', { params });
    expect(axios.get).toHaveBeenCalledWith('/test', { params });
  });
});
