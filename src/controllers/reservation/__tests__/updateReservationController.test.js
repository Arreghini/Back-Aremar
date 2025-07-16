// __tests__/updateReservationController.test.js

const { Reservation, Room } = require('../../../models');
const updateReservationController = require('../updateReservationController');
const { processRefund } = require('../../../services/refundService');

jest.mock('../../../models', () => ({
  Reservation: {
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  Room: {
    findOne: jest.fn(),
  },
}));

jest.mock('../../../services/refundService', () => ({
  processRefund: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('updateReservationController', () => {
  test('should update reservation and return success', async () => {
    processRefund.mockResolvedValue({ success: true, mensaje: 'Reembolso procesado' });

    const dataToUpdate = {
      roomId: 1,
      checkIn: '2024-08-01',
      checkOut: '2024-08-03',
      numberOfGuests: 2,
      status: 'confirmed',
      paymentId: 'payment123',
    };

    const mockRoom = { id: 1, price: 100 };
    const mockReservation = {
      id: 1,
      checkIn: '2024-07-20',
      checkOut: '2024-08-05',
      totalPrice: 500,
      amountPaid: 500,
      paymentId: 'paymentOld',
      update: jest.fn().mockResolvedValue({
        ...dataToUpdate,
        totalPrice: 200,
      }),
    };

    Room.findOne.mockResolvedValue(mockRoom);
    Reservation.findOne.mockResolvedValue(mockReservation);
    Reservation.findAll.mockResolvedValue([]);

    const result = await updateReservationController(1, dataToUpdate);

    expect(Room.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(Reservation.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(processRefund).toHaveBeenCalled();
    expect(mockReservation.update).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.mensaje).toContain('Reserva actualizada exitosamente');
  });

  test('should throw error if room not found', async () => {
    Room.findOne.mockResolvedValue(null);

    await expect(updateReservationController(1, { roomId: 99 })).rejects.toThrow(
      'No se encontró la habitación con id 99'
    );
  });

  test('should throw error if reservation not found', async () => {
    const mockRoom = { id: 1, price: 100 };
    Room.findOne.mockResolvedValue(mockRoom);
    Reservation.findOne.mockResolvedValue(null);

    await expect(updateReservationController(1, { roomId: 1 })).rejects.toThrow(
      'No se encontró la reserva con id 1'
    );
  });

  test('should return error if room is booked in given dates', async () => {
    const dataToUpdate = {
      roomId: 1,
      checkIn: '2024-08-01',
      checkOut: '2024-08-10',
      numberOfGuests: 2,
      status: 'confirmed',
      paymentId: 'payment123',
    };

    const mockRoom = { id: 1, price: 100 };
    const mockReservation = {
      id: 1,
      checkIn: '2024-07-20',
      checkOut: '2024-07-25',
      totalPrice: 500,
      amountPaid: 500,
      paymentId: 'paymentOld',
      update: jest.fn(),
    };

    const overlappingReservation = [{ id: 2 }];

    Room.findOne.mockResolvedValue(mockRoom);
    Reservation.findOne.mockResolvedValue(mockReservation);
    Reservation.findAll.mockResolvedValue(overlappingReservation);

    const result = await updateReservationController(1, dataToUpdate);

    expect(result.success).toBe(false);
    expect(result.mensaje).toBe('La habitación ya está reservada en esas fechas.');
  });

  test('should throw error if roomId is missing', async () => {
    await expect(updateReservationController(1, { checkIn: '2024-08-01' })).rejects.toThrow(
      'El campo roomId es obligatorio.'
    );
  });
});
