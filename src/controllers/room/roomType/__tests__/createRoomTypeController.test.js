const { RoomType } = require('../../../../models');
const { createRoomTypeController } = require('../createRoomTypeController');

jest.mock('../../../../models');

describe('createRoomTypeController', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpia mocks entre tests
  });

  test('should create a new room type successfully', async () => {
    const mockRoomType = {
      id: 1,
      name: 'Suite',
      description: 'Luxury suite room'
    };

    RoomType.create.mockResolvedValue(mockRoomType);

    const result = await createRoomTypeController({
      name: 'Suite',
      description: 'Luxury suite room'
    });

    expect(RoomType.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Suite'
    }));

    expect(result).toEqual(mockRoomType);
  });

  test('should throw error if room type creation fails', async () => {
    RoomType.create.mockRejectedValue(new Error('Database error'));

    await expect(createRoomTypeController({
      name: 'Suite',
      description: 'Luxury suite room'
    })).rejects.toThrow('Database error');
  });

  test('should handle empty name field', async () => {
    await expect(createRoomTypeController({
      name: '',
      description: 'Luxury suite room'
    })).rejects.toThrow();
  });

  test('should handle duplicate room type name', async () => {
    RoomType.create.mockRejectedValue(new Error('Room type already exists'));

    await expect(createRoomTypeController({
      name: 'Existing Suite',
      description: 'Luxury suite room'
    })).rejects.toThrow('Room type already exists');
  });

  test('should create room type with minimal required fields', async () => {
    const mockRoomType = {
      id: 1,
      name: 'Basic'
    };

    RoomType.create.mockResolvedValue(mockRoomType);

    const result = await createRoomTypeController({
      name: 'Basic'
    });

    expect(RoomType.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Basic'
    }));

    expect(result).toEqual(mockRoomType);
  });
});
