const { RoomType } = require('../../../../models');
const deleteRoomTypeController = require('../deleteRoomTypeController');

jest.mock('../../../../models', () => ({
  RoomType: {
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
}));

const mockRoomType = {
  id: 'TYPE-001',
  name: 'Test Room Type',
  description: 'Test Description',
  isActive: true,
};

describe('deleteRoomTypeController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should delete room type successfully', async () => {
    RoomType.findAll.mockResolvedValue([mockRoomType]);
    RoomType.destroy.mockResolvedValue(1);

    const result = await deleteRoomTypeController('TYPE-001');

    expect(RoomType.findAll).toHaveBeenCalledWith({ where: { id: 'TYPE-001'} });
    expect(RoomType.destroy).toHaveBeenCalledWith({ where: { id: 'TYPE-001'}, force: true });
    expect(result).toEqual([mockRoomType]);
  });

  test('should throw error when no id is provided', async () => {
  await expect(deleteRoomTypeController()).rejects.toThrow('No se proporcionó un ID de tipo de habitación válido');
  expect(RoomType.findAll).not.toHaveBeenCalled();
  expect(RoomType.destroy).not.toHaveBeenCalled();
});

  test('should return null when room type is not found', async () => {
    RoomType.findAll.mockResolvedValue([]);

    const result = await deleteRoomTypeController('TYPE-999');

    expect(RoomType.findAll).toHaveBeenCalledWith({ where: { id: 'TYPE-999' } });
    expect(RoomType.destroy).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test('should handle multiple room types with same id', async () => {
    const mockRoomTypes = [
      { id: 'TYPE-001', name: 'Type 1', description: 'Desc 1', isActive: true },
      { id: 'TYPE-001', name: 'Type 2', description: 'Desc 2', isActive: false },
    ];
    RoomType.findAll.mockResolvedValue(mockRoomTypes);
    RoomType.destroy.mockResolvedValue(2);

    const result = await deleteRoomTypeController('TYPE-001');

    expect(RoomType.findAll).toHaveBeenCalledWith({ where: { id: 'TYPE-001'} });
    expect(RoomType.destroy).toHaveBeenCalledWith({ where: { id: 'TYPE-001'}, force: true });
    expect(result).toEqual(mockRoomTypes);
  });

  test('should handle database errors during find operation', async () => {
    RoomType.findAll.mockRejectedValue(new Error('Database error'));

    await expect(deleteRoomTypeController('TYPE-001')).rejects.toThrow('Database error');
    expect(RoomType.destroy).not.toHaveBeenCalled();
  });

  test('should handle database errors during destroy operation', async () => {
    RoomType.findAll.mockResolvedValue([mockRoomType]);
    RoomType.destroy.mockRejectedValue(new Error('Delete error'));

    await expect(deleteRoomTypeController('TYPE-001')).rejects.toThrow('Delete error');
  });

 test('should handle empty string id', async () => {
  await expect(deleteRoomTypeController('')).rejects.toThrow('No se proporcionó un ID de tipo de habitación válido');
});

})
