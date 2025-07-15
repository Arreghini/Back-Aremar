let RoomDetail;
let getRoomDetailController;

describe('getRoomDetailController', () => {
  beforeEach(() => {
    jest.resetModules();

    jest.mock('../../../../models', () => ({
      RoomDetail: {
        findByPk: jest.fn()
      }
    }));

    RoomDetail = require('../../../../models').RoomDetail;
    getRoomDetailController = require('../getRoomDetailController');
  });

  test('should find room detail by id successfully', async () => {
    const mockRoomDetail = { id: '123', name: 'Detail 1' };
    RoomDetail.findByPk.mockResolvedValue(mockRoomDetail);

    const result = await getRoomDetailController('123');
    expect(RoomDetail.findByPk).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockRoomDetail);
  });

  test('should return null when room detail is not found', async () => {
    RoomDetail.findByPk.mockResolvedValue(null);

    const result = await getRoomDetailController('999');
    expect(RoomDetail.findByPk).toHaveBeenCalledWith('999');
    expect(result).toBeNull();
  });

  test('should handle database errors', async () => {
    RoomDetail.findByPk.mockRejectedValue(new Error('Database error'));

    await expect(getRoomDetailController('123')).rejects.toThrow('Database error');
  });

  test('should handle invalid id parameter', async () => {
    await expect(getRoomDetailController(undefined)).rejects.toThrow('Room detail ID must be provided');
    expect(RoomDetail.findByPk).not.toHaveBeenCalled();
  });

  test('should handle empty string id', async () => {
    await expect(getRoomDetailController('')).rejects.toThrow('Room detail ID cannot be empty');
    expect(RoomDetail.findByPk).not.toHaveBeenCalled();
  });

  test('should handle null id parameter', async () => {
    await expect(getRoomDetailController(null)).rejects.toThrow('Room detail ID must be provided');
    expect(RoomDetail.findByPk).not.toHaveBeenCalled();
  });

  test('should handle non-string id parameter', async () => {
    await expect(getRoomDetailController(123)).rejects.toThrow('Room detail ID must be a string');
    expect(RoomDetail.findByPk).not.toHaveBeenCalled();
  });

  test('should handle whitespace-only id', async () => {
    await expect(getRoomDetailController('   ')).rejects.toThrow('Room detail ID cannot be empty');
    expect(RoomDetail.findByPk).not.toHaveBeenCalled();
  });

  test('should handle room detail with missing properties', async () => {
    const incompleteDetail = { id: '123' }; // Falta por ejemplo el nombre
    RoomDetail.findByPk.mockResolvedValue(incompleteDetail);

    const result = await getRoomDetailController('123');
    expect(RoomDetail.findByPk).toHaveBeenCalledWith('123');
    expect(result).toEqual(incompleteDetail);
  });
});
