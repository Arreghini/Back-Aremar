// __tests__/partialRefundController.test.js
const partialRefundController = require('../partialRefundController');
const { Reservation, Refund } = require('../../../models');

jest.mock('../../../models', () => ({
  Reservation: {
    findByPk: jest.fn(),
  },
  Refund: {
    create: jest.fn(),
  },
}));

describe('partialRefundController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseReservation = {
    id: 1,
    totalPrice: 500,
    status: 'confirmed',
    checkIn: '2024-01-01',
    checkOut: '2024-01-10', // 9 días
    save: jest.fn().mockResolvedValue(),
    toJSON: function () { return {...this}; },
  };

  test('should create a partial refund successfully', async () => {
    const mockReservation = {...baseReservation};
    Reservation.findByPk.mockResolvedValue(mockReservation);
    Refund.create.mockResolvedValue({ id: 1 });

    const reservationId = 1;
    const newCheckOutDate = '2024-01-08'; // 7 días en lugar de 9
    const newCheckInDate = '2024-01-01';

    const result = await partialRefundController(reservationId, newCheckOutDate, newCheckInDate);

    expect(mockReservation.save).toHaveBeenCalled();
    expect(Refund.create).toHaveBeenCalledWith(expect.objectContaining({
      reservationId: reservationId,
      amount: expect.any(String),
      reason: 'Reembolso parcial por cambio de fecha de salida',
    }));
    expect(result).toHaveProperty('refundAmount');
    expect(result).toHaveProperty('refundId');
  });

  test('should throw error if reservation does not exist', async () => {
    Reservation.findByPk.mockResolvedValue(null);

    const reservationId = 999;
    const newCheckOutDate = '2024-01-08';
    const newCheckInDate = '2024-01-01';

    await expect(partialRefundController(reservationId, newCheckOutDate, newCheckInDate))
      .rejects.toThrow('Error al procesar el reembolso parcial: Reserva no encontrada');
  });

  test('should throw error if reservation is not confirmed', async () => {
    const mockReservation = {...baseReservation, status: 'pending'};
    Reservation.findByPk.mockResolvedValue(mockReservation);

    const reservationId = 1;
    const newCheckOutDate = '2024-01-08';
    const newCheckInDate = '2024-01-01';

    await expect(partialRefundController(reservationId, newCheckOutDate, newCheckInDate))
      .rejects.toThrow('Error al procesar el reembolso parcial: La reserva no está en estado confirmado');
  });

  test('should throw error if new checkout date is not earlier than original', async () => {
    const mockReservation = {...baseReservation};
    Reservation.findByPk.mockResolvedValue(mockReservation);

    const reservationId = 1;
    const newCheckOutDate = '2024-01-12'; // Fecha posterior a la original
    const newCheckInDate = '2024-01-01';

    await expect(partialRefundController(reservationId, newCheckOutDate, newCheckInDate))
      .rejects.toThrow('Error al procesar el reembolso parcial: No se puede realizar un reembolso parcial si la nueva fecha de salida es igual o posterior a la original');
  });

  test('should calculate refund amount correctly', async () => {
    const mockReservation = {...baseReservation};
    Reservation.findByPk.mockResolvedValue(mockReservation);
    Refund.create.mockResolvedValue({ id: 1 });

    const reservationId = 1;
    const newCheckOutDate = '2024-01-06'; // 5 días en lugar de 9, ahorra 4 días
    const newCheckInDate = '2024-01-01';

    const result = await partialRefundController(reservationId, newCheckOutDate, newCheckInDate);

    // Días originales: 9, nuevos días: 5, días a reembolsar: 4
    // Tarifa diaria: 500/9 = 55.56, reembolso: 55.56 * 4 = 222.22
    const expectedRefund = (500 / 9) * 4;
    
    expect(result.refundAmount).toBeCloseTo(expectedRefund, 2);
    expect(Refund.create).toHaveBeenCalledWith({
      reservationId: 1,
      amount: expectedRefund.toFixed(2),
      reason: 'Reembolso parcial por cambio de fecha de salida',
    });
  });

  test('should handle database errors during refund creation', async () => {
    Reservation.findByPk.mockRejectedValue(new Error('Error de base de datos'));

    const reservationId = 1;
    const newCheckOutDate = '2024-01-08';
    const newCheckInDate = '2024-01-01';

    await expect(partialRefundController(reservationId, newCheckOutDate, newCheckInDate))
      .rejects.toThrow('Error al procesar el reembolso parcial: Error de base de datos');
  });
});
