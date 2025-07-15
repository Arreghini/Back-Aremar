const { RoomType } = require('../../../../models');
const getRoomTypeController = require('../getRoomTypeController');

jest.mock('../../../../models', () => ({
  RoomType: {
    findAll: jest.fn(),
  },
}));

const mockRoomTypes = [
  {
    id: 'TYPE-001',
    name: 'Suite Deluxe',
    description: 'Habitación amplia con vista al mar',
    capacity: 4,
    price: 150,
    isActive: true,
  },
  {
    id: 'TYPE-002',
    name: 'Standard',
    description: 'Habitación estándar',
    capacity: 2,
    price: 80,
    isActive: true,
  },
];

describe('getRoomTypeController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get all room types successfully', async () => {
    RoomType.findAll.mockResolvedValue(mockRoomTypes);

    const result = await getRoomTypeController();

    expect(RoomType.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockRoomTypes);
  });

  test('should return empty array when no room types exist', async () => {
    RoomType.findAll.mockResolvedValue([]);

    const result = await getRoomTypeController();

    expect(RoomType.findAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test('should handle database errors during room type retrieval', async () => {
    RoomType.findAll.mockRejectedValue(new Error('Database error'));

    await expect(getRoomTypeController()).rejects.toThrow('Database error');
  });
});
