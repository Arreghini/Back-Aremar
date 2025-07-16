const cancelReservationWithRefundController = require('../cancelReservationWithRefundController');
const { Reservation, Refund } = require('../../../models');

jest.mock('../../../models', () => ({
  Reservation: {
    findByPk: jest.fn(),
  },
  Refund: {
    create: jest.fn(),
  },
}));

describe('cancelReservationWithRefundController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should cancel reservation and create refund with 90%', async () => {
    const saveMock = jest.fn();
    const refundMock = { id: 123 };
    const today = new Date();
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() + 10);

    Reservation.findByPk = jest.fn().mockResolvedValue({
      id: 1,
      userId: 2,
      status: 'confirmed',
      checkInDate: checkInDate.toISOString(),
      totalPrice: 1000,
      save: saveMock,
    });

    Refund.create = jest.fn().mockResolvedValue(refundMock);

    const result = await cancelReservationWithRefundController({
      reservationId: 1,
      userId: 2,
      isAdmin: false,
    });

    expect(result.refundAmount).toBe(900);
    expect(result.refundId).toBe(123);
    expect(saveMock).toHaveBeenCalled();
    expect(Refund.create).toHaveBeenCalledWith({
      amount: 900,
      reason: 'Cancelación por usuario',
    });
  });

  test('should refund 50% if between 3 and 6 days before check-in', async () => {
    const saveMock = jest.fn();
    const refundMock = { id: 456 };
    const today = new Date();
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() + 4);

    Reservation.findByPk = jest.fn().mockResolvedValue({
      id: 2,
      userId: 5,
      status: 'confirmed',
      checkInDate: checkInDate.toISOString(),
      totalPrice: 2000,
      save: saveMock,
    });

    Refund.create = jest.fn().mockResolvedValue(refundMock);

    const result = await cancelReservationWithRefundController({
      reservationId: 2,
      userId: 5,
      isAdmin: false,
    });

    expect(result.refundAmount).toBe(1000);
    expect(result.refundId).toBe(456);
    expect(Refund.create).toHaveBeenCalledWith({
      amount: 1000,
      reason: 'Cancelación por usuario',
    });
  });

  test('should refund 10% if less than 3 days before check-in', async () => {
    const saveMock = jest.fn();
    const refundMock = { id: 789 };
    const today = new Date();
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() + 1);

    Reservation.findByPk = jest.fn().mockResolvedValue({
      id: 3,
      userId: 8,
      status: 'confirmed',
      checkInDate: checkInDate.toISOString(),
      totalPrice: 500,
      save: saveMock,
    });

    Refund.create = jest.fn().mockResolvedValue(refundMock);

    const result = await cancelReservationWithRefundController({
      reservationId: 3,
      userId: 8,
      isAdmin: false,
    });

    expect(result.refundAmount).toBe(50);
    expect(result.refundId).toBe(789);
    expect(Refund.create).toHaveBeenCalledWith({
      amount: 50,
      reason: 'Cancelación por usuario',
    });
  });
});
