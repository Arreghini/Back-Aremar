
const request = require('supertest');
const express = require('express');

jest.mock('../../../controllers/reservation/webHookController');
const webhookController = require('../../../controllers/reservation/webHookController');
const webhookHandler = require('../../../handlers/reservation/webhookHandler');

describe('webhookHandler', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());

    // Montamos el handler
    app.post('/webhook', webhookHandler());
  });

  it('debe llamar al webhookController y devolver el status que este envíe', async () => {
    // Simulamos que el controlador envía una respuesta
    webhookController.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true });
    });

    const res = await request(app)
      .post('/webhook')
      .send({ test: 'data' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(webhookController).toHaveBeenCalledTimes(1);
    expect(webhookController).toHaveBeenCalledWith(
      expect.any(Object), // req
      expect.any(Object)  // res
    );
  });

  it('debe devolver 500 si webhookController lanza un error', async () => {
    webhookController.mockRejectedValue(new Error('Error en webhook'));

    const res = await request(app)
      .post('/webhook')
      .send({ fail: true });

    expect(res.status).toBe(500);
    expect(res.text).toBe(''); // porque solo hace send() vacío
  });
});
