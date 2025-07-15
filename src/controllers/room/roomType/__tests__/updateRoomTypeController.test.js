const { RoomType } = require('../../../../models');
const updateRoomTypeController = require('../updateRoomTypeController');

jest.mock('../../../../models', () => ({
  RoomType: {
    findByPk: jest.fn(),
    update: jest.fn()
  }
}));

describe('updateRoomTypeController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRoomTypeData = {
    id: '123',
    name: 'Deluxe Suite',
    description: 'Luxury room with ocean view',
    capacity: 4,
    price: 299.99,
    isActive: true,
    kingBeds: 0,
    simpleBeds: 0,
    trundleBeds: 0,
    windows: 0
  };

  test('should update room type successfully', async () => {
    RoomType.findByPk
      .mockResolvedValueOnce(mockRoomTypeData) // Para verificar existencia
      .mockResolvedValueOnce(mockRoomTypeData); // Para devolver el actualizado

    RoomType.update.mockResolvedValue([1]);

    const updateData = {
      price: 399.99,
      description: 'Updated luxury room'
    };

    const result = await updateRoomTypeController('123', updateData);

    expect(RoomType.findByPk).toHaveBeenCalledWith('123');
    expect(RoomType.update).toHaveBeenCalledWith(
      expect.any(Object),
      { where: { id: '123' } }
    );
    expect(result).toEqual(mockRoomTypeData);
  });

  test('should throw error if room type does not exist', async () => {
    RoomType.findByPk.mockResolvedValue(null);

    await expect(updateRoomTypeController('123', { price: 399.99 }))
      .rejects
      .toThrow('Room type not found');

    expect(RoomType.update).not.toHaveBeenCalled();
  });

  test('should handle database errors during update', async () => {
    RoomType.findByPk
      .mockResolvedValueOnce(mockRoomTypeData);

    RoomType.update.mockRejectedValue(new Error('Database error'));

    await expect(updateRoomTypeController('123', { price: 399.99 }))
      .rejects
      .toThrow('Database error');
  });

  test('should handle invalid update data', async () => {
    RoomType.findByPk
      .mockResolvedValueOnce(mockRoomTypeData);

    RoomType.update.mockRejectedValue(new Error('Invalid update data'));

    const invalidData = { price: 'invalid' };

    await expect(updateRoomTypeController('123', invalidData))
      .rejects
      .toThrow('Invalid update data');
  });

});
