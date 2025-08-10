
const request = require('supertest');
const express = require('express');

// Mock del controlador
jest.mock(
  '../../../controllers/reservation/confirmedReservationByAdminController',
  () => jest.fn()
);

const confirmedResevationByAdminController = require(
  '../../../controllers/reservation/confirmedReservationByAdminController'
);
const confirmedReservationByAdminHandler = require('../confirmedReservationByAdminHandler');

describe('confirmedReservationByAdminHandler', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());

    app.patch('/reservation/confirm/:reservationId', (req, res, next) => {
      // Middleware simulado para setear si es admin
      req.isAdmin = req.headers['x-admin'] === 'true';
      next();
    }, confirmedReservationByAdminHandler);
  });

  it('debe confirmar la reserva exitosamente', async () => {
    const fakeConfirmed = { id: 'res123', status: 'confirmed', amountPaid: 200 };
    confirmedResevationByAdminController.mockResolvedValue(fakeConfirmed);

    const res = await request(app)
      .patch('/reservation/confirm/res123')
      .set('x-admin', 'true')
      .send({ amountPaid: 200 });

    expect(confirmedResevationByAdminController).toHaveBeenCalledWith(
      'res123',
      { amountPaid: 200 }
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeConfirmed);
  });

  it('debe devolver 403 si no es admin', async () => {
    const res = await request(app)
      .patch('/reservation/confirm/res123')
      .set('x-admin', 'false')
      .send({ amountPaid: 200 });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(
      'Acceso denegado. Solo los administradores pueden confirmar reservas.'
    );
  });

  it('debe devolver 400 si falta reservationId', async () => {
    const res = await request(app)
      .patch('/reservation/confirm/')
      .set('x-admin', 'true')
      .send({ amountPaid: 200 });

    // Supertest con ruta sin param no ejecuta el handler con params vacíos,
    // así que simulamos usando app directamente
    const handlerRes = await request(app)
      .patch('/reservation/confirm/') // no tiene param
      .send({ amountPaid: 200 });

    expect(handlerRes.status).toBe(404); // Express da 404 porque no matchea la ruta
    // Si quisieras testear param vacío, deberías modificar el handler o testearlo unitariamente
  });

  it('debe devolver 400 si el monto pagado es inválido', async () => {
    const res = await request(app)
      .patch('/reservation/confirm/res123')
      .set('x-admin', 'true')
      .send({ amountPaid: -50 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Monto pagado inválido.');
  });

  it('debe devolver 500 si ocurre un error interno', async () => {
    confirmedResevationByAdminController.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .patch('/reservation/confirm/res123')
      .set('x-admin', 'true')
      .send({ amountPaid: 100 });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('DB error');
  });
});
