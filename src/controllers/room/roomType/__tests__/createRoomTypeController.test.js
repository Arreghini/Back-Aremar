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
test('should create room type with all optional fields', async () => {
  const mockRoomType = {
    id: 1,
    name: 'Deluxe Suite',
    photos: ['photo1.jpg', 'photo2.jpg'],
    simpleBeds: 2,
    trundleBeds: 1,
    kingBeds: 1,
    windows: 3,
    price: 299.99
  };

  RoomType.create.mockResolvedValue(mockRoomType);

  const result = await createRoomTypeController(mockRoomType);

  expect(RoomType.create).toHaveBeenCalledWith(expect.objectContaining({
    id: 1,
    name: 'Deluxe Suite',
    photos: ['photo1.jpg', 'photo2.jpg'],
    simpleBeds: 2,
    trundleBeds: 1,
    kingBeds: 1,
    windows: 3,
    price: 299.99
  }));

  expect(result).toEqual(mockRoomType);
});

test('should handle invalid price value', async () => {
  const mockRoomType = {
    name: 'Budget Room',
    price: 'invalid'
  };

  RoomType.create.mockRejectedValue(new Error('Invalid price value'));

  await expect(createRoomTypeController(mockRoomType)).rejects.toThrow('Invalid price value');
});

test('should handle invalid bed counts', async () => {
  const mockRoomType = {
    name: 'Test Room',
    simpleBeds: -1,
    trundleBeds: -2,
    kingBeds: -3
  };

  RoomType.create.mockRejectedValue(new Error('Invalid bed counts'));

  await expect(createRoomTypeController(mockRoomType)).rejects.toThrow('Invalid bed counts');
});

test('should handle invalid photo array', async () => {
  const mockRoomType = {
    name: 'Photo Room',
    photos: 'not-an-array'
  };

  RoomType.create.mockRejectedValue(new Error('Photos must be an array'));

  await expect(createRoomTypeController(mockRoomType)).rejects.toThrow('Photos must be an array');
});

test('should handle missing name with other valid fields', async () => {
  const mockRoomType = {
    photos: ['photo.jpg'],
    simpleBeds: 2,
    price: 150.00
  };

  RoomType.create.mockRejectedValue(new Error('Name is required'));

  await expect(createRoomTypeController(mockRoomType)).rejects.toThrow('Name is required');
});

test('should create room type with zero values for bed counts', async () => {
  const mockRoomType = {
    id: 1,
    name: 'No Bed Room',
    simpleBeds: 0,
    trundleBeds: 0,
    kingBeds: 0,
    price: 50.00
  };

  RoomType.create.mockResolvedValue(mockRoomType);

  const result = await createRoomTypeController(mockRoomType);

  expect(RoomType.create).toHaveBeenCalledWith(expect.objectContaining({
    simpleBeds: 0,
    trundleBeds: 0,
    kingBeds: 0
  }));

  expect(result).toEqual(mockRoomType);
});
