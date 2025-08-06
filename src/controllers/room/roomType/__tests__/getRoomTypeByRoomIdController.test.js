const { Room } = require('../../../../models');
const getRoomTypeByRoomIdController = require('../getRoomTypeByRoomIdController');

jest.mock('../../../../models', () => ({
  RoomType: {}, // no lo usamos directamente
  Room: {
    findOne: jest.fn(),
  },
}));

describe('getRoomTypeByRoomIdController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRoomType = {
    id: '123',
    name: 'Test Room Type',
    description: 'Test Description',
    capacity: 2,
    price: 100,
    isActive: true,
  };

  const mockRoom = {
    id: '1',
    roomType: mockRoomType,
  };

  test('should get room type by room ID with associated roomType', async () => {
    Room.findOne.mockResolvedValue(mockRoom);

    const result = await getRoomTypeByRoomIdController('123');

    expect(Room.findOne).toHaveBeenCalledWith({
      where: { id: '123' },
      include: expect.any(Array),
    });

    expect(result).toEqual(mockRoomType);
  });

  test('should return null if room does not exist', async () => {
    Room.findOne.mockResolvedValue(null);

    const result = await getRoomTypeByRoomIdController('123');

    expect(Room.findOne).toHaveBeenCalledWith({
      where: { id: '123' },
      include: expect.any(Array),
    });

    expect(result).toBeNull();
  });

  test('should throw error if room ID is not provided', async () => {
    await expect(getRoomTypeByRoomIdController())
      .rejects
      .toThrow('Room ID is required');

    expect(Room.findOne).not.toHaveBeenCalled();
  });

  test('should handle database errors during room type retrieval', async () => {
    Room.findOne.mockRejectedValue(new Error('Database error'));

    await expect(getRoomTypeByRoomIdController('123'))
      .rejects
      .toThrow('Database error');
  });

  test('should return null for invalid room ID format', async () => {
    Room.findOne.mockResolvedValue(null);

    const result = await getRoomTypeByRoomIdController('invalid-id');

    expect(Room.findOne).toHaveBeenCalledWith({
      where: { id: 'invalid-id' },
      include: expect.any(Array),
    });

    expect(result).toBeNull();
  });

  test('should handle empty room associations (room exists but no roomType)', async () => {
    Room.findOne.mockResolvedValue({ id: '1', roomType: null });

    const result = await getRoomTypeByRoomIdController('123');

    expect(Room.findOne).toHaveBeenCalledWith({
      where: { id: '123' },
      include: expect.any(Array),
    });

    expect(result).toBeNull(); // o result === null según lo que prefieras
  });
});
