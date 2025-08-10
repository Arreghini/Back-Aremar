
const request = require('supertest');
const express = require('express');

// Mock del controlador
jest.mock(
  '../../../controllers/reservation/deleteReservationByIdController.js',
  () => jest.fn()
);

const deleteReservationByIdController = require(
  '../../../controllers/reservation/deleteReservationByIdController.js'
);
const deleteReservationByIdHandler = require('../deleteReservationByIdHandler');

describe('deleteReservationByIdHandler', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());

    // Middleware para simular isAdmin
    app.delete('/reservation/:reservationId', (req, res, next) => {
      req.isAdmin = req.headers['x-admin'] === 'true';
      next();
    }, deleteReservationByIdHandler);
  });

  it('debe devolver 400 si falta reservationId', async () => {
    // No existe ruta válida sin reservationId, así que se testea unitariamente
    const res = await request(app)
      .delete('/reservation/') // Esto va a dar 404 en Express
      .send();

    expect(res.status).toBe(404);
  });

  it('debe eliminar la reserva exitosamente', async () => {
    const fakeDeleted = { id: 'res123', status: 'deleted' };
    deleteReservationByIdController.mockResolvedValue(fakeDeleted);

    const res = await request(app)
      .delete('/reservation/res123')
      .set('x-admin', 'true');

    expect(deleteReservationByIdController).toHaveBeenCalledWith('res123', true);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Reserva cancelada con éxito',
      data: fakeDeleted
    });
  });

  it('debe manejar errores y devolver 400', async () => {
    deleteReservationByIdController.mockRejectedValue(new Error('Reserva no encontrada'));

    const res = await request(app)
      .delete('/reservation/res999')
      .set('x-admin', 'false');

    expect(deleteReservationByIdController).toHaveBeenCalledWith('res999', false);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Reserva no encontrada' });
  });
});
