const { Room } = require('../../../models');
const updateRoomController = require('../updateRoomController');

jest.mock('../../../models', () => ({
  Room: {
    findByPk: jest.fn()
  }
}));

describe('updateRoomController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRoomData = {
    id: '123',
    name: 'Test Room',
    description: 'Test Description',
    photoRoom: ['photo1.jpg', 'photo2.jpg'],
    price: 100,
    isActive: true
  };

  test('should update room successfully', async () => {
    const mockUpdate = jest.fn().mockResolvedValue({ ...mockRoomData, name: 'Updated Room' });
    Room.findByPk.mockResolvedValue({
      update: mockUpdate
    });

    const result = await updateRoomController('123', { name: 'Updated Room' });

    expect(Room.findByPk).toHaveBeenCalledWith('123');
    expect(mockUpdate).toHaveBeenCalledWith({ name: 'Updated Room' });
    expect(result).toEqual({ ...mockRoomData, name: 'Updated Room' });
  });

  test('should return null if room not found', async () => {
    Room.findByPk.mockResolvedValue(null);

    const result = await updateRoomController('123', mockRoomData);

    expect(Room.findByPk).toHaveBeenCalledWith('123');
    expect(result).toBeNull();
  });

  test('should throw error if photoRoom is not an array', async () => {
    Room.findByPk.mockResolvedValue({
      update: jest.fn()
    });

    const invalidRoomData = {
      ...mockRoomData,
      photoRoom: 'not-an-array'
    };

    await expect(updateRoomController('123', invalidRoomData))
      .rejects
      .toThrow('photoRoom debe ser un array.');
  });

  test('should handle database errors during update', async () => {
    const mockUpdate = jest.fn().mockRejectedValue(new Error('Database error'));
    Room.findByPk.mockResolvedValue({
      update: mockUpdate
    });

    await expect(updateRoomController('123', mockRoomData))
      .rejects
      .toThrow('Database error');
  });

  test('should update room with empty photoRoom array', async () => {
    const mockUpdate = jest.fn().mockResolvedValue({ ...mockRoomData, photoRoom: [] });
    Room.findByPk.mockResolvedValue({
      update: mockUpdate
    });

    const result = await updateRoomController('123', { photoRoom: [] });

    expect(mockUpdate).toHaveBeenCalledWith({ photoRoom: [] });
    expect(result.photoRoom).toEqual([]);
  });
});
