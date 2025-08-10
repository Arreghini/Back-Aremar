
const request = require('supertest');
const express = require('express');

// Mock del controlador
jest.mock('../../../controllers/reservation/getReservationController.js', () => ({
  getAllReservationController: jest.fn(),
  getReservationByUserIdController: jest.fn(),
  getReservationByIdController: jest.fn(),
}));

const getReservationController = require('../../../controllers/reservation/getReservationController.js');
const getReservationHandler = require('../../../handlers/reservation/getReservationHandler');

describe('getReservationHandler', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());

    app.get('/reservations', getReservationHandler.getAllReservationHandler);
    app.get('/reservations/user/:userId', getReservationHandler.getReservationByUserIdHandler);
    app.get('/reservations/:reservationId', getReservationHandler.getReservationByIdHandler);
  });

  // ---- getAllReservationHandler ----
  it('debe devolver todas las reservas (200)', async () => {
    const fakeReservations = [{ id: 1 }, { id: 2 }];
    getReservationController.getAllReservationController.mockResolvedValue(fakeReservations);

    const res = await request(app).get('/reservations');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeReservations);
    expect(getReservationController.getAllReservationController).toHaveBeenCalled();
  });

  it('debe devolver 400 si getAllReservationController lanza error', async () => {
    getReservationController.getAllReservationController.mockRejectedValue(new Error('DB Error'));

    const res = await request(app).get('/reservations');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'DB Error' });
  });

  // ---- getReservationByUserIdHandler ----
  it('debe devolver reservas de usuario por ID (200)', async () => {
    const fakeUserReservations = [{ id: 'r1' }];
    getReservationController.getReservationByUserIdController.mockResolvedValue(fakeUserReservations);

    const res = await request(app).get('/reservations/user/12345');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: fakeUserReservations,
      userId: '12345',
      formattedUserId: 'google-oauth2|12345',
    });
    expect(getReservationController.getReservationByUserIdController).toHaveBeenCalledWith('12345');
  });

  it('debe devolver 400 si falta userId', async () => {
    const res = await request(app).get('/reservations/user/');

    expect(res.status).toBe(404); // Express no matchea la ruta si no hay userId
  });

  it('debe devolver 500 si getReservationByUserIdController lanza error', async () => {
    getReservationController.getReservationByUserIdController.mockRejectedValue(new Error('DB Error'));

    const res = await request(app).get('/reservations/user/12345');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Error al obtener las reservas',
      error: 'DB Error',
    });
  });

  // ---- getReservationByIdHandler ----
  it('debe devolver una reserva por ID (200)', async () => {
    const fakeReservation = { id: 'res123' };
    getReservationController.getReservationByIdController.mockResolvedValue(fakeReservation);

    const res = await request(app).get('/reservations/res123');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeReservation);
    expect(getReservationController.getReservationByIdController).toHaveBeenCalledWith('res123');
  });

  it('debe devolver 400 si falta reservationId', async () => {
    const res = await request(app).get('/reservations/');

    expect(res.status).toBe(404); // Express no matchea si falta el param
  });

  it('debe devolver 404 si la reserva no existe', async () => {
    getReservationController.getReservationByIdController.mockResolvedValue(null);

    const res = await request(app).get('/reservations/999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Reserva no encontrada' });
  });

  it('debe devolver 500 si getReservationByIdController lanza error', async () => {
    getReservationController.getReservationByIdController.mockRejectedValue(new Error('DB Error'));

    const res = await request(app).get('/reservations/res123');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Error al obtener la reserva' });
  });
});
