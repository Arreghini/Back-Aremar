const { Reservation } = require('../../../models');
const createPreference = require('../createPreferenceController');

jest.mock('mercadopago', () => {
  const mockCreate = jest.fn();
  return {
    MercadoPagoConfig: jest.fn(),
    Preference: jest.fn(() => ({
      create: mockCreate,
    })),
    __mockCreate: mockCreate, // Exponemos el mock para acceder a él fácilmente
  };
});

// Mock del modelo Reservation
jest.mock('../../../models', () => ({
  Reservation: {
    findByPk: jest.fn(),
  },
}));

describe('createPreference', () => {
  let req;
  let res;
  let mockCreate;
  let mockReservation;

  beforeAll(() => {
    // Obtenemos el mock de create
    const mercadopago = require('mercadopago');
    mockCreate = mercadopago.__mockCreate;
  });

  beforeEach(() => {
    // Definimos mockReservation en beforeEach para que esté disponible en todos los tests
    mockReservation = {
      id: 1,
      roomId: 'room123',
      totalPrice: 1000,
      amountPaid: 0,
    };

    req = {
      body: {
        reservationId: 1,
        paymentType: 'total',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Configuramos variables de entorno
    process.env.CLOUDFLARED_URL = 'https://test.com';
    process.env.MP_ACCESS_TOKEN = 'test_token';

    jest.clearAllMocks();
  });

  test('should create preference for total payment', async () => {
    Reservation.findByPk.mockResolvedValue(mockReservation);
    mockCreate.mockResolvedValue({ id: 'pref123' });

    await createPreference(req, res);

    expect(res.json).toHaveBeenCalledWith({
      preferenceId: 'pref123',
      price: 1000,
      reservationId: 1,
      title: 'Reserva habitación room123',
    });
  });

  test('should create preference for deposit payment', async () => {
    req.body.paymentType = 'deposit';
    Reservation.findByPk.mockResolvedValue(mockReservation);
    mockCreate.mockResolvedValue({ id: 'pref123' });

    await createPreference(req, res);

    expect(res.json).toHaveBeenCalledWith({
      preferenceId: 'pref123',
      price: 500, // 50% del total
      reservationId: 1,
      title: 'Reserva habitación room123',
    });
  });

  test('should create preference for remaining payment', async () => {
    req.body.paymentType = 'remaining';
    const reservationWithPayment = { ...mockReservation, amountPaid: 300 };
    Reservation.findByPk.mockResolvedValue(reservationWithPayment);
    mockCreate.mockResolvedValue({ id: 'pref123' });

    await createPreference(req, res);

    expect(res.json).toHaveBeenCalledWith({
      preferenceId: 'pref123',
      price: 700, // 1000 - 300
      reservationId: 1,
      title: 'Reserva habitación room123',
    });
  });

  test('should return 404 when reservation is not found', async () => {
    Reservation.findByPk.mockResolvedValue(null);

    await createPreference(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Reserva no encontrada' });
  });

  test('should handle invalid payment type', async () => {
    req.body.paymentType = 'invalid';
    Reservation.findByPk.mockResolvedValue(mockReservation);

    await createPreference(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Tipo de pago desconocido: invalid' });
  });

  test('should handle missing totalPrice', async () => {
    const reservationWithoutPrice = { ...mockReservation, totalPrice: null };
    Reservation.findByPk.mockResolvedValue(reservationWithoutPrice);

    await createPreference(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'El precio total de la reserva no está definido.' });
  });

  test('should handle MercadoPago API error', async () => {
    Reservation.findByPk.mockResolvedValue(mockReservation);
    mockCreate.mockRejectedValue(new Error('API Error'));

    await createPreference(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'API Error' });
  });

  test('should use correct URLs in preference data', async () => {
    process.env.CLOUDFLARED_URL = 'https://test.com';
    Reservation.findByPk.mockResolvedValue(mockReservation);
    mockCreate.mockResolvedValue({ id: 'pref123' });

    await createPreference(req, res);

    // Verificamos que create fue llamado con los parámetros correctos
    expect(mockCreate).toHaveBeenCalledWith({
      body: expect.objectContaining({
        back_urls: expect.objectContaining({
          success: expect.stringContaining('https://test.com/api/payment/redirect'),
          failure: expect.stringContaining('https://test.com/api/payment/redirect'),
          pending: expect.stringContaining('https://test.com/api/payment/redirect'),
        }),
        notification_url: 'https://test.com/api/webhooks/mercadopago',
      }),
    });
  });
});