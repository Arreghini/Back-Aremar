// src/controllers/reservation/__tests__/updateReservationController.test.js
const updateReservationController = require('../updateReservationController');
const { Reservation, Room } = require('../../../models');
const { processRefund } = require('../../../services/refundService');

// Mocks de servicios y modelos
jest.mock('../../../services/refundService', () => ({
  processRefund: jest.fn(),
}));

jest.mock('../../../models', () => ({
  Reservation: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  },
  Room: {
    findOne: jest.fn(),
  },
}));

describe('updateReservationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should proceed with refund when amount decreased', async () => {
    const mockReservation = {
      id: 1,
      amountPaid: 500,
      totalPrice: 500,
      paymentId: 'pay_123',
      roomId: 1,
      checkIn: new Date('2025-08-01'),
      checkOut: new Date('2025-08-05'),
      update: jest.fn().mockResolvedValue(true),
    };

    Reservation.findByPk.mockResolvedValue(mockReservation);
    Reservation.findOne.mockResolvedValue(mockReservation);
    Reservation.findAll.mockResolvedValue([]); // Sin solapamientos
    Room.findOne.mockResolvedValue({ id: 1, name: 'Habitación Test', price: 125 });

    processRefund.mockResolvedValue({
      success: true,
      mensaje: 'Reembolso de 300.00 procesado correctamente.',
    });

    const result = await updateReservationController(mockReservation.id, {
      checkIn: '2025-08-02',
      checkOut: '2025-08-04',
      amount: 200,
      roomId: 1,
      numberOfGuests: 2,
      status: 'confirmed',
      paymentId: 'pay_123',
    });

    expect(result.success).toBe(true);
    expect(result.mensaje).toBe(
      'Reserva actualizada exitosamente con reembolso de $250.00'
    );
    expect(processRefund).toHaveBeenCalledWith({
  reservationId: 1,
  paymentId: 'pay_123',
  amount: 250,
  reason: 'Reembolso parcial por cambio de fechas',
});

    expect(mockReservation.update).toHaveBeenCalled();
  });

  it('should update reservation without refund when amount increased', async () => {
    const mockReservation = {
      id: 2,
      amountPaid: 200,
      totalPrice: 200,
      paymentId: 'pay_456',
      roomId: 2,
      checkIn: new Date('2025-08-01'),
      checkOut: new Date('2025-08-05'),
      update: jest.fn().mockResolvedValue(true),
    };

    Reservation.findByPk.mockResolvedValue(mockReservation);
    Reservation.findOne.mockResolvedValue(mockReservation);
    Reservation.findAll.mockResolvedValue([]); // Sin solapamientos
    Room.findOne.mockResolvedValue({ id: 2, name: 'Habitación Test 2', price: 100 });

    const result = await updateReservationController(mockReservation.id, {
      checkIn: '2025-08-02',
      checkOut: '2025-08-06', // +1 día
      amount: 300,
      roomId: 2,
      numberOfGuests: 2,
      status: 'confirmed',
      paymentId: 'pay_456',
    });

    expect(result.success).toBe(true);
    expect(result.mensaje).toBe('Reserva actualizada exitosamente');
    expect(processRefund).not.toHaveBeenCalled();
    expect(mockReservation.update).toHaveBeenCalled();
  });
});
