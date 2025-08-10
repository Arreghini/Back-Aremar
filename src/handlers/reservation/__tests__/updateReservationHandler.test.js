
const request = require('supertest');
const express = require('express');

jest.mock('../../../controllers/reservation/updateReservationController');
const updateReservationController = require('../../../controllers/reservation/updateReservationController');
const updateReservationHandler = require('../../../handlers/reservation/updateReservationHandler');

describe('updateReservationHandler', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());

    app.put('/reservations/:reservationId', updateReservationHandler);
  });

  it('debe devolver 400 si reservationId no es un número', async () => {
    const res = await request(app)
      .put('/reservations/abc')
      .send({ amountPaid: 100 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      mensaje: 'ID de reserva inválido',
      data: null,
    });
    expect(updateReservationController).not.toHaveBeenCalled();
  });

  it('debe devolver 200 si la actualización es exitosa', async () => {
    const fakeUpdatedReservation = {
      success: true,
      mensaje: 'Reserva actualizada',
      data: { id: 1, amountPaid: 200 },
    };

    updateReservationController.mockResolvedValue(fakeUpdatedReservation);

    const res = await request(app)
      .put('/reservations/1')
      .send({ amountPaid: 200 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeUpdatedReservation);
    expect(updateReservationController).toHaveBeenCalledWith(1, { amountPaid: 200 });
  });

  it('debe devolver 409 si el controlador devuelve success: false', async () => {
    updateReservationController.mockResolvedValue({
      success: false,
      mensaje: 'La reserva no puede ser actualizada',
      data: null,
    });

    const res = await request(app)
      .put('/reservations/1')
      .send({ amountPaid: 50 });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      success: false,
      mensaje: 'La reserva no puede ser actualizada',
      data: null,
    });
  });

  it('debe devolver 400 si el controlador lanza un error', async () => {
    updateReservationController.mockRejectedValue(new Error('Error de base de datos'));

    const res = await request(app)
      .put('/reservations/1')
      .send({ amountPaid: 100 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      mensaje: 'Error de base de datos',
      data: null,
    });
  });
});
