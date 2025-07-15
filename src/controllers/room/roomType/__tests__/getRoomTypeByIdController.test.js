const { Room, RoomType } = require('../../../../models');
const getRoomTypeByIdController = require('../getRoomTypeByIdController');

jest.mock('../../../../models', () => ({
  RoomType: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
  Room: {
    findAll: jest.fn(),
  },
}));

describe('getRoomTypeByIdController', () => {
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

  test('should get room type by ID with associated rooms', async () => {
    RoomType.findByPk.mockResolvedValue(mockRoomType);
    Room.findAll.mockResolvedValue([{ id: '1', roomTypeId: '123' }]);

    const result = await getRoomTypeByIdController('123');

    expect(RoomType.findByPk).toHaveBeenCalledWith('123', expect.any(Object));
    expect(result).toEqual(mockRoomType);
  });

  test('should return null if room type does not exist', async () => {
    RoomType.findByPk.mockResolvedValue(null);

    const result = await getRoomTypeByIdController('123');

    expect(RoomType.findByPk).toHaveBeenCalledWith('123', expect.any(Object));
    expect(result).toBeNull();
  });

  test('should throw error if room type ID is not provided', async () => {
    await expect(getRoomTypeByIdController())
      .rejects
      .toThrow('Room Type ID is required');

    expect(RoomType.findByPk).not.toHaveBeenCalled();
  });

  test('should handle database errors during room type retrieval', async () => {
    RoomType.findByPk.mockRejectedValue(new Error('Database error'));

    await expect(getRoomTypeByIdController('123'))
      .rejects
      .toThrow('Database error');
  });

  test('should return null for invalid room type ID format', async () => {
    RoomType.findByPk.mockResolvedValue(null);

    const result = await getRoomTypeByIdController('invalid-id');

    expect(RoomType.findByPk).toHaveBeenCalledWith('invalid-id', expect.any(Object));
    expect(result).toBeNull();
  });

  test('should handle empty room associations', async () => {
    RoomType.findByPk.mockResolvedValue(mockRoomType);
    Room.findAll.mockResolvedValue([]);

    const result = await getRoomTypeByIdController('123');

    expect(RoomType.findByPk).toHaveBeenCalledWith('123', expect.any(Object));
    expect(result).toEqual(mockRoomType);
  });
});
