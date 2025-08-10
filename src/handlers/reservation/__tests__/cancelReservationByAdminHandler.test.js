
const request = require('supertest');
const express = require('express');

// Mock del controlador
jest.mock(
  '../../../controllers/reservation/cancelReservationControllerByAdmin.js',
  () => jest.fn()
);

const cancelReservationControllerByAdmin = require(
  '../../../controllers/reservation/cancelReservationControllerByAdmin.js'
);
const cancelReservationByAdminHandler = require('../cancelReservationByAdminHandler');

describe('cancelReservationByAdminHandler', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.delete('/reservation/:reservationId', (req, res, next) => {
      // Simulamos que el usuario es admin
      req.isAdmin = true;
      next();
    }, cancelReservationByAdminHandler);
  });

  it('debe cancelar la reserva exitosamente', async () => {
    cancelReservationControllerByAdmin.mockResolvedValue({ success: true });

    const res = await request(app)
      .delete('/reservation/123');

    expect(cancelReservationControllerByAdmin).toHaveBeenCalledWith({
      reservationId: '123',
      isAdmin: true
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Reserva cancelada exitosamente'
    });
  });

  it('debe manejar errores y devolver 400', async () => {
    cancelReservationControllerByAdmin.mockRejectedValue(new Error('Reserva no encontrada'));

    const res = await request(app)
      .delete('/reservation/999');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Reserva no encontrada' });
    expect(cancelReservationControllerByAdmin).toHaveBeenCalledWith({
      reservationId: '999',
      isAdmin: true
    });
  });
});
