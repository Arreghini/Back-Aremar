const { Op } = require('sequelize');
const {
  getAllRoomController,
  getAvailableRoomByIdController,
  getAvailableRoomsController,
  findOverlappingReservations,
} = require('../getRoomController');

const { Room, Reservation, RoomType } = require('../../../models');

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
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
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
        [Op.or]: expect.any(Array),
      },
    });
    expect(result).toEqual([mockReservation]);
  });

  test('should find overlapping reservations without roomId', async () => {
    Reservation.findAll.mockResolvedValue([mockReservation]);

    const result = await findOverlappingReservations(
      null,
      '2024-01-03',
      '2024-01-07',
      2
    );

    expect(Reservation.findAll).toHaveBeenCalledWith({
      where: {
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

  test('should throw if checkIn is missing', async () => {
    await expect(
      findOverlappingReservations('ROOM-001', null, '2024-01-05')
    ).rejects.toThrow('Both checkIn and checkOut dates are required');
  });

  test('should throw if checkOut is missing', async () => {
    await expect(
      findOverlappingReservations('ROOM-001', '2024-01-01', null)
    ).rejects.toThrow('Both checkIn and checkOut dates are required');
  });

  test('should throw if checkIn is invalid date format', async () => {
    await expect(
      findOverlappingReservations('ROOM-001', 'invalid-date', '2024-01-05')
    ).rejects.toThrow('Invalid date format');
  });

  test('should throw if checkOut is invalid date format', async () => {
    await expect(
      findOverlappingReservations('ROOM-001', '2024-01-01', 'invalid-date')
    ).rejects.toThrow('Invalid date format');
  });

  test('should handle empty array result', async () => {
    Reservation.findAll.mockResolvedValue([]);

    const result = await findOverlappingReservations(
      'ROOM-001',
      '2024-01-01',
      '2024-01-05'
    );

    expect(result).toEqual([]);
  });

  test('should handle multiple overlapping reservations', async () => {
    const multipleReservations = [mockReservation, { ...mockReservation, id: 2 }];
    Reservation.findAll.mockResolvedValue(multipleReservations);

    const result = await findOverlappingReservations(
      'ROOM-001',
      '2024-01-01',
      '2024-01-05'
    );

    expect(result).toEqual(multipleReservations);
  });
});

describe('getAllRoomController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  test('should get all rooms successfully', async () => {
    Room.findAll.mockResolvedValue([mockRoom]);

    const result = await getAllRoomController();

    expect(Room.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockRoom]);
  });

  test('should handle empty rooms list', async () => {
    Room.findAll.mockResolvedValue([]);

    const result = await getAllRoomController();

    expect(Room.findAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test('should handle database error', async () => {
    const error = new Error('Database connection failed');
    Room.findAll.mockRejectedValue(error);

    await expect(getAllRoomController()).rejects.toThrow('Database connection failed');
    expect(console.error).toHaveBeenCalledWith('Error fetching rooms:', error);
  });

  test('should handle multiple rooms', async () => {
    const multipleRooms = [mockRoom, { ...mockRoom, id: 'ROOM-456' }];
    Room.findAll.mockResolvedValue(multipleRooms);

    const result = await getAllRoomController();

    expect(Room.findAll).toHaveBeenCalled();
    expect(result).toEqual(multipleRooms);
  });
});

describe('getAvailableRoomByIdController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  test('should return room when available and no overlapping reservations', async () => {
    Reservation.findAll.mockResolvedValue([]);
    Room.findOne.mockResolvedValue(mockRoom);

    const result = await getAvailableRoomByIdController(
      'ROOM-123',
      '2024-01-01',
      '2024-01-05'
    );

    expect(Reservation.findAll).toHaveBeenCalledWith({
      where: {
        roomId: 'ROOM-123',
        status: { [Op.in]: ['confirmed', 'pending'] },
        [Op.or]: expect.any(Array),
      },
    });
    expect(Room.findOne).toHaveBeenCalledWith({
      where: { id: 'ROOM-123', status: 'available' },
      include: [
        {
          model: RoomType,
          required: true,
        },
      ],
    });
    expect(result).toEqual(mockRoom);
    expect(console.log).toHaveBeenCalledWith('Verificando disponibilidad para la habitación:', 'ROOM-123');
    expect(console.log).toHaveBeenCalledWith('Habitación encontrada:', 'ROOM-123');
  });

  test('should return null when room has overlapping reservations', async () => {
    Reservation.findAll.mockResolvedValue([mockReservation]);
    Room.findOne.mockResolvedValue(mockRoom);

    const result = await getAvailableRoomByIdController(
      'ROOM-123',
      '2024-01-01',
      '2024-01-05'
    );

    expect(Reservation.findAll).toHaveBeenCalled();
    expect(Room.findOne).not.toHaveBeenCalled();
    expect(result).toBeNull();
    expect(console.log).toHaveBeenCalledWith('La habitación está reservada en el rango de fechas dado.');
  });

  test('should return null when room is not found', async () => {
    Reservation.findAll.mockResolvedValue([]);
    Room.findOne.mockResolvedValue(null);

    const result = await getAvailableRoomByIdController(
      'ROOM-123',
      '2024-01-01',
      '2024-01-05'
    );

    expect(Reservation.findAll).toHaveBeenCalled();
    expect(Room.findOne).toHaveBeenCalled();
    expect(result).toBeNull();
    expect(console.log).toHaveBeenCalledWith('Habitación encontrada:', 'Ninguna');
  });

  test('should handle database error in findOverlappingReservations', async () => {
    const error = new Error('Database error');
    Reservation.findAll.mockRejectedValue(error);

    await expect(
      getAvailableRoomByIdController('ROOM-123', '2024-01-01', '2024-01-05')
    ).rejects.toThrow('Database error');

    expect(console.error).toHaveBeenCalledWith('Error específico:', error.message);
  });

  test('should handle database error in Room.findOne', async () => {
    Reservation.findAll.mockResolvedValue([]);
    const error = new Error('Room not found');
    Room.findOne.mockRejectedValue(error);

    await expect(
      getAvailableRoomByIdController('ROOM-123', '2024-01-01', '2024-01-05')
    ).rejects.toThrow('Room not found');

    expect(console.error).toHaveBeenCalledWith('Error específico:', error.message);
  });

  test('should handle room with different status', async () => {
    Reservation.findAll.mockResolvedValue([]);
    Room.findOne.mockResolvedValue(null);

    const result = await getAvailableRoomByIdController(
      'ROOM-123',
      '2024-01-01',
      '2024-01-05'
    );

    expect(result).toBeNull();
  });

  test('should handle multiple overlapping reservations', async () => {
    const multipleReservations = [mockReservation, { ...mockReservation, id: 2 }];
    Reservation.findAll.mockResolvedValue(multipleReservations);

    const result = await getAvailableRoomByIdController(
      'ROOM-123',
      '2024-01-01',
      '2024-01-05'
    );

    expect(result).toBeNull();
  });
});

describe('getAvailableRoomsController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  test('should get available rooms successfully', async () => {
    const mockRoomWithType = {
      ...mockRoom,
      roomType: { price: 150 }
    };

    Reservation.findAll.mockResolvedValue([]);
    Room.findAll.mockResolvedValue([mockRoomWithType]);

    const result = await getAvailableRoomsController(
      1,
      'TYPE-001',
      '2024-01-01',
      '2024-01-05',
      2
    );

    expect(Reservation.findAll).toHaveBeenCalledWith({
      where: {
        id: { [Op.ne]: 1 },
        status: { [Op.in]: ['confirmed', 'pending'] },
        [Op.or]: expect.any(Array),
      },
    });
    expect(Room.findAll).toHaveBeenCalledWith({
      where: {
        roomTypeId: 'TYPE-001',
        id: {
          [Op.notIn]: [],
        },
        status: 'available',
      },
      include: [
        {
          model: RoomType,
          as: 'roomType',
          required: true,
          attributes: ['price'],
        },
      ],
    });
    expect(result).toEqual([mockRoomWithType]);
    expect(console.log).toHaveBeenCalledWith('Iniciando búsqueda de habitaciones...');
    expect(console.log).toHaveBeenCalledWith('Habitaciones encontradas:', 1);
  });

  test('should filter out reserved rooms', async () => {
    const reservedRoom = { ...mockReservation, roomId: 'ROOM-001' };
    const availableRoom = { ...mockRoom, id: 'ROOM-002' };

    Reservation.findAll.mockResolvedValue([reservedRoom]);
    Room.findAll.mockResolvedValue([availableRoom]);

    const result = await getAvailableRoomsController(
      1,
      'TYPE-001',
      '2024-01-01',
      '2024-01-05',
      2
    );

    expect(Room.findAll).toHaveBeenCalledWith({
      where: {
        roomTypeId: 'TYPE-001',
        id: {
          [Op.notIn]: ['ROOM-001'],
        },
        status: 'available',
      },
      include: [
        {
          model: RoomType,
          as: 'roomType',
          required: true,
          attributes: ['price'],
        },
      ],
    });
    expect(result).toEqual([availableRoom]);
  });

  test('should return empty array when no rooms available', async () => {
    Reservation.findAll.mockResolvedValue([]);
    Room.findAll.mockResolvedValue([]);

    const result = await getAvailableRoomsController(
      1,
      'TYPE-001',
      '2024-01-01',
      '2024-01-05',
      2
    );

    expect(result).toEqual([]);
    expect(console.log).toHaveBeenCalledWith('Habitaciones encontradas:', 0);
  });

  test('should handle all rooms reserved', async () => {
    const reservedRoom1 = { ...mockReservation, roomId: 'ROOM-001' };
    const reservedRoom2 = { ...mockReservation, roomId: 'ROOM-002' };

    Reservation.findAll.mockResolvedValue([reservedRoom1, reservedRoom2]);
    Room.findAll.mockResolvedValue([]);

    const result = await getAvailableRoomsController(
      1,
      'TYPE-001',
      '2024-01-01',
      '2024-01-05',
      2
    );

    expect(Room.findAll).toHaveBeenCalledWith({
      where: {
        roomTypeId: 'TYPE-001',
        id: {
          [Op.notIn]: ['ROOM-001', 'ROOM-002'],
        },
        status: 'available',
      },
      include: [
        {
          model: RoomType,
          as: 'roomType',
          required: true,
          attributes: ['price'],
        },
      ],
    });
    expect(result).toEqual([]);
  });

  test('should handle database error in findOverlappingReservations', async () => {
    const error = new Error('Database error');
    Reservation.findAll.mockRejectedValue(error);

    await expect(
      getAvailableRoomsController(1, 'TYPE-001', '2024-01-01', '2024-01-05', 2)
    ).rejects.toThrow('Database error');

    expect(console.error).toHaveBeenCalledWith('Error específico:', error.message);
  });

  test('should handle database error in Room.findAll', async () => {
    Reservation.findAll.mockResolvedValue([]);
    const error = new Error('Room query failed');
    Room.findAll.mockRejectedValue(error);

    await expect(
      getAvailableRoomsController(1, 'TYPE-001', '2024-01-01', '2024-01-05', 2)
    ).rejects.toThrow('Room query failed');

    expect(console.error).toHaveBeenCalledWith('Error específico:', error.message);
  });

  test('should handle without reservationId', async () => {
    const mockRoomWithType = {
      ...mockRoom,
      roomType: { price: 150 }
    };

    Reservation.findAll.mockResolvedValue([]);
    Room.findAll.mockResolvedValue([mockRoomWithType]);

    const result = await getAvailableRoomsController(
      null,
      'TYPE-001',
      '2024-01-01',
      '2024-01-05',
      2
    );

    expect(Reservation.findAll).toHaveBeenCalledWith({
      where: {
        status: { [Op.in]: ['confirmed', 'pending'] },
        [Op.or]: expect.any(Array),
      },
    });
    expect(result).toEqual([mockRoomWithType]);
  });

  test('should handle with undefined reservationId', async () => {
    const mockRoomWithType = {
      ...mockRoom,
      roomType: { price: 150 }
    };

    Reservation.findAll.mockResolvedValue([]);
    Room.findAll.mockResolvedValue([mockRoomWithType]);

    const result = await getAvailableRoomsController(
      undefined,
      'TYPE-001',
      '2024-01-01',
      '2024-01-05',
      2
    );

    expect(Reservation.findAll).toHaveBeenCalledWith({
      where: {
        status: { [Op.in]: ['confirmed', 'pending'] },
        [Op.or]: expect.any(Array),
      },
    });
    expect(result).toEqual([mockRoomWithType]);
  });

  test('should handle with zero reservationId', async () => {
    const mockRoomWithType = {
      ...mockRoom,
      roomType: { price: 150 }
    };

    Reservation.findAll.mockResolvedValue([]);
    Room.findAll.mockResolvedValue([mockRoomWithType]);

    const result = await getAvailableRoomsController(
      0,
      'TYPE-001',
      '2024-01-01',
      '2024-01-05',
      2
    );

    expect(Reservation.findAll).toHaveBeenCalledWith({
      where: {
        status: { [Op.in]: ['confirmed', 'pending'] },
        [Op.or]: expect.any(Array),
      },
    });
    expect(result).toEqual([mockRoomWithType]);
  });

  test('should handle multiple available rooms', async () => {
    const mockRoom1 = { ...mockRoom, id: 'ROOM-001', roomType: { price: 150 } };
    const mockRoom2 = { ...mockRoom, id: 'ROOM-002', roomType: { price: 200 } };

    Reservation.findAll.mockResolvedValue([]);
    Room.findAll.mockResolvedValue([mockRoom1, mockRoom2]);

    const result = await getAvailableRoomsController(
      1,
      'TYPE-001',
      '2024-01-01',
      '2024-01-05',
      2
    );

    expect(result).toEqual([mockRoom1, mockRoom2]);
    expect(console.log).toHaveBeenCalledWith('Habitaciones encontradas:', 2);
  });
});
