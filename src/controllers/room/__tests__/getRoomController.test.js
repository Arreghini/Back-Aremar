const { Op } = require('sequelize');
const {
  getAllRoomController,
  getAvailableRoomByIdController,
  findOverlappingReservations,
} = require('../getRoomController');

const { Room, Reservation } = require('../../../models');

jest.mock('../../../models', () => ({
  Room: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
  Reservation: {
    findAll: jest.fn(),
  },
  RoomType: {},
}));

const mockReservation = {
  id: 1,
  roomId: 'ROOM-001',
  checkIn: '2024-01-01',
  checkOut: '2024-01-05',
  status: 'confirmed',
};

const mockRoom = {
  id: 'ROOM-123',
  description: 'Test Room',
  roomTypeId: 'TYPE-001',
  price: 100.5,
  status: 'available',
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

  test('should handle same day check-in and check-out', async () => {
    Reservation.findAll.mockResolvedValue([]);

    const result = await findOverlappingReservations(
      'ROOM-001',
      '2024-01-03',
      '2024-01-03'
    );

    expect(Reservation.findAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test('should throw if checkOut is before checkIn', async () => {
    await expect(
      findOverlappingReservations('ROOM-001', '2024-01-10', '2024-01-01')
    ).rejects.toThrow('checkOut date cannot be before checkIn date');
  });
});

describe('getAllRoomController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get all rooms', async () => {
    Room.findAll.mockResolvedValue([mockRoom]);

    const result = await getAllRoomController();

    expect(Room.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockRoom]);
  });

  test('should return null when room is not found by ID', async () => {
    Reservation.findAll.mockResolvedValue([]);
    Room.findOne.mockResolvedValue(null);

    const result = await getAvailableRoomByIdController(
      'ROOM-123',
      '2024-01-01',
      '2024-01-05'
    );

    expect(result).toBeNull();
  });
});
