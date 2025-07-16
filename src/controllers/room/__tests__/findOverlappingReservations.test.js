// src/controllers/room/__tests__/findOverlappingReservations.test.js

const { Op } = require('sequelize');
const { Reservation } = require('../../../models');

const getRoomController = require('../getRoomController');
const { findOverlappingReservations } = getRoomController;


// 👇 Asegurate que el path coincida con el que usa el controlador
jest.mock('../../../models', () => ({
    
  Reservation: {
    findAll: jest.fn(),
  },
}));

const mockReservation = {
  id: 1,
  roomId: 'ROOM-001',
  checkIn: '2024-01-01',
  checkOut: '2024-01-05',
  status: 'confirmed',
};

describe('findOverlappingReservations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should find overlapping reservations with all parameters', async () => {
    Reservation.findAll.mockResolvedValue([mockReservation]);

    const result = await findOverlappingReservations(
      'ROOM-001',
      '2024-01-03',
      '2024-01-07',
      2
    );

    expect(Reservation.findAll).toHaveBeenCalledWith({
      where: {
        roomId: 'ROOM-001',
        id: { [Op.ne]: 2 },
        status: { [Op.in]: ['confirmed', 'pending'] },
        [Op.or]: expect.any(Array),
      },
    });
    expect(result).toEqual([mockReservation]);
  });

  test('should handle database error', async () => {
    Reservation.findAll.mockRejectedValue(new Error('Database error'));

    await expect(
      findOverlappingReservations('ROOM-001', '2024-01-03', '2024-01-07')
    ).rejects.toThrow('Database error');
  });

test('should handle invalid date format', async () => {
    await expect(
      findOverlappingReservations('ROOM-001', 'invalid-date', '2024-01-07')
    ).rejects.toThrow('Invalid date format');
  });
  test('should handle checkOut date before checkIn date', async () => {
    await expect(
      findOverlappingReservations('ROOM-001', '2024-01-07', '2024-01-03')
    ).rejects.toThrow('checkOut date cannot be before checkIn date');
  });
  test('should handle missing checkIn date', async () => {
    await expect(
      findOverlappingReservations('ROOM-001', null, '2024-01-07')
    ).rejects.toThrow('Both checkIn and checkOut dates are required');
  });
  test('should handle missing checkOut date', async () => {
    await expect(
      findOverlappingReservations('ROOM-001', '2024-01-03', null)
    ).rejects.toThrow('Both checkIn and checkOut dates are required');
  });
  
});
