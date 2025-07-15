const { RoomDetail } = require('../../../../models');
const deleteRoomDetailController = require('../deleteRoomDetailController');

jest.mock('../../../../models');

describe('deleteRoomDetailController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

 test('should successfully delete a room detail', async () => {
  const mockRoomDetail = {
    id: '123',
    destroy: jest.fn()
  };

  RoomDetail.findByPk.mockResolvedValue(mockRoomDetail);

  const result = await deleteRoomDetailController('123');

  expect(RoomDetail.findByPk).toHaveBeenCalledWith('123');
  expect(mockRoomDetail.destroy).toHaveBeenCalled();
  expect(result).toBe(mockRoomDetail); // ✅ corregido
});

test('should throw error when room detail is not found', async () => {
  RoomDetail.findByPk.mockResolvedValue(null);

  await expect(deleteRoomDetailController('123')).rejects.toThrow('RoomDetail no encontrado'); // ✅ corregido
  expect(RoomDetail.findByPk).toHaveBeenCalledWith('123');
});

  test('should throw error when database operation fails', async () => {
    RoomDetail.findByPk.mockRejectedValue(new Error('Database error'));

    await expect(deleteRoomDetailController('123')).rejects.toThrow('Database error');
    expect(RoomDetail.findByPk).toHaveBeenCalledWith('123');
  });

  test('should handle invalid id parameter', async () => {
    await expect(deleteRoomDetailController(null)).rejects.toThrow('Invalid room detail ID');
    expect(RoomDetail.findByPk).not.toHaveBeenCalled();
  });

  test('should handle empty id parameter', async () => {
    await expect(deleteRoomDetailController('')).rejects.toThrow('Invalid room detail ID');
    expect(RoomDetail.findByPk).not.toHaveBeenCalled();
  });
})
