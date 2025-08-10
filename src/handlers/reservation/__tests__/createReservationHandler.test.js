
const request = require('supertest');
const express = require('express');

// Mock del controlador
jest.mock('../../../controllers/reservation/createReservationController', () => jest.fn());

const createReservationController = require('../../../controllers/reservation/createReservationController');
const createReservationHandler = require('../createReservationHandler');

describe('createReservationHandler', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());

    // Ruta para el handler
    app.post('/reservation', createReservationHandler);
  });

  it('debe crear una reserva exitosamente', async () => {
    const fakeReservation = { id: 'res123', guestName: 'Juan Pérez' };
    createReservationController.mockResolvedValue(fakeReservation);

    const res = await request(app)
      .post('/reservation')
      .send({ guestName: 'Juan Pérez', roomType: 'Suite' });

    expect(createReservationController).toHaveBeenCalledWith({
      guestName: 'Juan Pérez',
      roomType: 'Suite'
    });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      success: true,
      data: fakeReservation
    });
  });

  it('debe devolver 500 si ocurre un error en el controlador', async () => {
    createReservationController.mockRejectedValue(new Error('DB Error'));

    const res = await request(app)
      .post('/reservation')
      .send({ guestName: 'Juan Pérez', roomType: 'Suite' });

    expect(createReservationController).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al crear la reserva' });
  });
});
