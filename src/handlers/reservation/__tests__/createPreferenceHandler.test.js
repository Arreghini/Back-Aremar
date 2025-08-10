
const request = require('supertest');
const express = require('express');

// Mock del controlador
jest.mock(
  '../../../controllers/reservation/createPreferenceController',
  () => jest.fn()
);

const createPreference = require(
  '../../../controllers/reservation/createPreferenceController'
);
const createPreferenceHandler = require('../createPreferenceHandler');

describe('createPreferenceHandler', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());

    // Ruta para el handler
    app.post('/preference/:reservationId', createPreferenceHandler);
  });

  it('debe devolver 400 si falta o es inválido reservationId', async () => {
    const res = await request(app)
      .post('/preference/abc') // no es número válido
      .send({ amount: 1000 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: 'Falta el ID de la reserva o es inválido',
    });
    expect(createPreference).not.toHaveBeenCalled();
  });

  it('debe llamar a createPreference exitosamente', async () => {
    // Mock de createPreference para que simule enviar respuesta
    createPreference.mockImplementation((req, res) => {
      res.status(200).json({ success: true, preferenceId: 'pref_123' });
    });

    const res = await request(app)
      .post('/preference/456')
      .send({ amount: 2000 });

    expect(createPreference).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ reservationId: 456, amount: 2000 }),
        params: { reservationId: '456' },
      }),
      expect.any(Object)
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, preferenceId: 'pref_123' });
  });

  it('debe devolver 500 si ocurre un error en createPreference', async () => {
    createPreference.mockImplementation(() => {
      throw new Error('Fallo en MercadoPago');
    });

    const res = await request(app)
      .post('/preference/789')
      .send({ amount: 3000 });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Error al crear preferencia de pago');
    expect(res.body.message).toBe('Fallo en MercadoPago');
  });
});
