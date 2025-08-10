
const request = require('supertest');
const express = require('express');

// Mock del controlador
jest.mock(
  '../../../controllers/reservation/cancelReservationWithRefundController.js',
  () => jest.fn()
);

const cancelReservationWithRefundController = require(
  '../../../controllers/reservation/cancelReservationWithRefundController.js'
);
const cancelReservationWithRefundHandler = require('../cancelReservationWithRefundHandler');

describe('cancelReservationWithRefundHandler', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());

    // Middleware para simular datos del usuario y si es admin
    app.delete('/reservation/refund/:reservationId', (req, res, next) => {
      req.user = { id: 'user123' };
      req.isAdmin = true;
      next();
    }, cancelReservationWithRefundHandler);
  });

  it('debe cancelar la reserva con reembolso exitosamente', async () => {
    const fakeRefund = { refundAmount: 100, currency: 'USD' };
    cancelReservationWithRefundController.mockResolvedValue(fakeRefund);

    const res = await request(app)
      .delete('/reservation/refund/abc123');

    expect(cancelReservationWithRefundController).toHaveBeenCalledWith({
      reservationId: 'abc123',
      userId: 'user123',
      isAdmin: true
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Reserva cancelada con reembolso exitosamente',
      refund: fakeRefund
    });
  });

  it('debe manejar errores y devolver 400', async () => {
    cancelReservationWithRefundController.mockRejectedValue(new Error('Reserva no encontrada'));

    const res = await request(app)
      .delete('/reservation/refund/xyz999');

    expect(cancelReservationWithRefundController).toHaveBeenCalledWith({
      reservationId: 'xyz999',
      userId: 'user123',
      isAdmin: true
    });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Reserva no encontrada' });
  });
});
