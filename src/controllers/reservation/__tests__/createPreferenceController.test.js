const { Reservation } = require('../../../models');
const createPreference = require('../createPreferenceController');

// Mock del modelo Reservation
jest.mock('../../../models', () => ({
  Reservation: {
    findByPk: jest.fn(),
  },
}));

jest.mock('mercadopago', () => {
  const mockCreate = jest.fn();
  const MockPreference = jest.fn(() => ({
    create: mockCreate,
  }));
  
  return {
    MercadoPagoConfig: jest.fn(),
    Preference: MockPreference,
    // Exportamos mockCreate para poder acceder a él en los tests
    __mockCreate: mockCreate,
  };
});

describe('createPreference', () => {
  let req;
  let res;
  let mercadopago;
  let createMock;
  let Reservation;

  // Mock de reserva que será reutilizado
  const mockReservation = {
    id: 1,
    roomId: 'room123',
    totalPrice: 1000,
    amountPaid: 0,
  };

  beforeAll(() => {
    mercadopago = require('mercadopago');
    // Importamos el mock de Reservation
    Reservation = require('../../../models').Reservation;
    // Accedemos al mock de create de manera más directa
    createMock = mercadopago.__mockCreate;
  });

  beforeEach(() => {
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

    // Configuramos la variable de entorno por defecto
    process.env.CLOUDFLARED_URL = 'http://localhost:3000';

    jest.clearAllMocks();
  });

  test('should create preference for total payment', async () => {
    Reservation.findByPk.mockResolvedValue(mockReservation);
    createMock.mockResolvedValue({ id: 'pref123' });

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
    createMock.mockResolvedValue({ id: 'pref123' });

    await createPreference(req, res);

    expect(res.json).toHaveBeenCalledWith({
      preferenceId: 'pref123',
      price: 500,
      reservationId: 1,
      title: 'Reserva habitación room123',
    });
  });

  test('should create preference for remaining payment', async () => {
    req.body.paymentType = 'remaining';
    const reservationWithPayment = { ...mockReservation, amountPaid: 300 };
    Reservation.findByPk.mockResolvedValue(reservationWithPayment);
    createMock.mockResolvedValue({ id: 'pref123' });

    await createPreference(req, res);

    expect(res.json).toHaveBeenCalledWith({
      preferenceId: 'pref123',
      price: 700,
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
    createMock.mockRejectedValue(new Error('API Error'));

    await createPreference(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'API Error' });
  });

  test('should use correct URLs in preference data', async () => {
    process.env.CLOUDFLARED_URL = 'https://test.com';
    Reservation.findByPk.mockResolvedValue(mockReservation);
    createMock.mockResolvedValue({ id: 'pref123' });

    await createPreference(req, res);

    expect(createMock).toHaveBeenCalledWith({
      body: expect.objectContaining({
        back_urls: expect.objectContaining({
          success: expect.stringContaining('https://test.com/api/payment/redirect'),
        }),
        notification_url: 'https://test.com/api/webhooks/mercadopago',
      }),
    });
  });
});
