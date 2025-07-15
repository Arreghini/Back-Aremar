const { Reservation } = require('../../../models');
const { Op } = require('sequelize');
const { findOverlappingReservations } = require('../getRoomController');

jest.mock('../../../models', () => ({
  Reservation: {
    findAll: jest.fn()
  }
}));
const mockReservation = {
  id: 1,
  roomId: 'ROOM-001',
  checkIn: '2024-01-01',
  checkOut: '2024-01-05',
  status: 'confirmed'
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
        [Op.or]: expect.any(Array)
      }
    });
    expect(result).toEqual([mockReservation]);
  });

  test('should find overlapping reservations without excludeReservationId', async () => {
    Reservation.findAll.mockResolvedValue([mockReservation]);

    const result = await findOverlappingReservations(
      'ROOM-001',
      '2024-01-03',
      '2024-01-07'
    );

    expect(Reservation.findAll).toHaveBeenCalledWith({
      where: {
        roomId: 'ROOM-001',
        status: { [Op.in]: ['confirmed', 'pending'] },
        [Op.or]: expect.any(Array)
      }
    });
    expect(result).toEqual([mockReservation]);
  });

  test('should find overlapping reservations without roomId', async () => {
    Reservation.findAll.mockResolvedValue([mockReservation]);

    const result = await findOverlappingReservations(
      null,
      '2024-01-03',
      '2024-01-07'
    );

    expect(Reservation.findAll).toHaveBeenCalledWith({
      where: {
        status: { [Op.in]: ['confirmed', 'pending'] },
        [Op.or]: expect.any(Array)
      }
    });
    expect(result).toEqual([mockReservation]);
  });

  test('should handle empty result', async () => {
    Reservation.findAll.mockResolvedValue([]);

    const result = await findOverlappingReservations(
      'ROOM-001',
      '2024-01-03',
      '2024-01-07'
    );

    expect(result).toEqual([]);
  });

  test('should handle database error', async () => {
    Reservation.findAll.mockRejectedValue(new Error('Database error'));

    await expect(findOverlappingReservations(
      'ROOM-001',
      '2024-01-03',
      '2024-01-07'
    )).rejects.toThrow('Database error');
  });
});
describe('findOverlappingReservations edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle invalid date formats', async () => {
    await expect(findOverlappingReservations(
      'ROOM-001',
      'invalid-date',
      '2024-01-07'
    )).rejects.toThrow();
  });

 test('should handle checkOut date before checkIn date', async () => {
  await expect(
    findOverlappingReservations(
      'ROOM-001',
      '2024-01-10',
      '2024-01-05'
    )
  ).rejects.toThrow('checkOut date cannot be before checkIn date');
});

  test('should handle same day check-in and check-out', async () => {
    Reservation.findAll.mockResolvedValue([]);

    const result = await findOverlappingReservations(
      'ROOM-001',
      '2024-01-03',
      '2024-01-03'
    );

    expect(Reservation.findAll).toHaveBeenCalledWith({
      where: {
        roomId: 'ROOM-001',
        status: { [Op.in]: ['confirmed', 'pending'] },
        [Op.or]: expect.any(Array)
      }
    });
    expect(result).toEqual([]);
  });

  test('should handle very distant future dates', async () => {
    Reservation.findAll.mockResolvedValue([]);

    const result = await findOverlappingReservations(
      'ROOM-001',
      '2050-01-01',
      '2050-12-31'
    );

    expect(Reservation.findAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test('should handle multiple overlapping reservations', async () => {
    const multipleReservations = [
      {
        id: 1,
        roomId: 'ROOM-001',
        checkIn: '2024-01-01',
        checkOut: '2024-01-05',
        status: 'confirmed'
      },
      {
        id: 2,
        roomId: 'ROOM-001',
        checkIn: '2024-01-04',
        checkOut: '2024-01-08',
        status: 'pending'
      }
    ];

    Reservation.findAll.mockResolvedValue(multipleReservations);

    const result = await findOverlappingReservations(
      'ROOM-001',
      '2024-01-03',
      '2024-01-06'
    );

    expect(Reservation.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result).toEqual(multipleReservations);
  });
});
const { Room } = require('../../../models');
const getRoomController = require('../getRoomController');

jest.mock('../../../models', () => ({
  Room: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn()
  }
}));

const mockRoom = {
  id: 'ROOM-123',
  description: 'Test Room',
  roomTypeId: 'TYPE-001',
  price: 100.50,
  status: 'available'
};

describe('getRoomController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get all rooms when no id is provided', async () => {
    Room.findAll.mockResolvedValue([mockRoom]);
    
    const result = await getRoomController();
    
    expect(Room.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockRoom]);
  });

  test('should get specific room by id', async () => {
    Room.findByPk.mockResolvedValue(mockRoom);
    
    const result = await getRoomController('ROOM-123');
    
    expect(Room.findByPk).toHaveBeenCalledWith('ROOM-123');
    expect(result).toEqual(mockRoom);
  });

  test('should return null when room is not found', async () => {
    Room.findByPk.mockResolvedValue(null);
    
    const result = await getRoomController('NONEXISTENT');
    
    expect(Room.findByPk).toHaveBeenCalledWith('NONEXISTENT');
    expect(result).toBeNull();
  });

  test('should handle database errors during findAll', async () => {
    Room.findAll.mockRejectedValue(new Error('Database error'));
    
    await expect(getRoomController()).rejects.toThrow('Database error');
  });

  test('should handle database errors during findByPk', async () => {
    Room.findByPk.mockRejectedValue(new Error('Database error'));
    
    await expect(getRoomController('ROOM-123')).rejects.toThrow('Database error');
  });

  test('should handle invalid id format', async () => {
    const result = await getRoomController('');
    
    expect(Room.findAll).toHaveBeenCalled();
    expect(Room.findByPk).not.toHaveBeenCalled();
  });

  test('should include associated models when fetching rooms', async () => {
    Room.findAll.mockResolvedValue([mockRoom]);
    
    await getRoomController();
    
    expect(Room.findAll).toHaveBeenCalledWith(expect.objectContaining({
      include: expect.any(Array)
    }));
  });
});
