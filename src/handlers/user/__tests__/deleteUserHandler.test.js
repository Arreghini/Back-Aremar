const deleteRoomController = require('../deleteRoomController');
const { Room } = require('../../../models');

jest.mock('../../../models', () => ({
  Room: {
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
}));

const mockRoom = { id: '123', name: 'Test Room' };

describe('deleteRoomController', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Limpiar mocks después de cada test
  });

  test('should delete room successfully', async () => {
    Room.findAll.mockResolvedValue([mockRoom]);
    Room.destroy.mockResolvedValue(1);

    const result = await deleteRoomController('123');

    expect(Room.findAll).toHaveBeenCalledWith({ where: { id: '123' } });
    expect(Room.destroy).toHaveBeenCalledWith({ where: { id: '123' } });
    expect(result).toEqual({ message: 'Deleted' });
  });

  test('should return null when no id is provided', async () => {
    const result = await deleteRoomController();

    expect(Room.findAll).not.toHaveBeenCalled();
    expect(Room.destroy).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test('should return null when room is not found', async () => {
    Room.findAll.mockResolvedValue([]);

    const result = await deleteRoomController('999');

    expect(Room.findAll).toHaveBeenCalledWith({ where: { id: '999' } });
    expect(Room.destroy).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test('should handle empty room array result', async () => {
    Room.findAll.mockResolvedValue([]);

    const result = await deleteRoomController('123');

    expect(Room.findAll).toHaveBeenCalledWith({ where: { id: '123' } });
    expect(Room.destroy).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test('should handle undefined id parameter', async () => {
    const result = await deleteRoomController(undefined);

    expect(Room.findAll).not.toHaveBeenCalled();
    expect(Room.destroy).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test('should handle null id parameter', async () => {
    const result = await deleteRoomController(null);

    expect(Room.findAll).not.toHaveBeenCalled();
    expect(Room.destroy).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test('should handle destroy operation returning 0 affected rows', async () => {
    Room.findAll.mockResolvedValue([mockRoom]);
    Room.destroy.mockResolvedValue(0);

    const result = await deleteRoomController('123');

    expect(Room.findAll).toHaveBeenCalledWith({ where: { id: '123' } });
    expect(Room.destroy).toHaveBeenCalledWith({ where: { id: '123' } });
    expect(result).toBeNull();
  });

  test('should handle database errors during find', async () => {
    Room.findAll.mockRejectedValue(new Error('DB error'));

    await expect(deleteRoomController('123')).rejects.toThrow('DB error');
  });

  test('should handle database errors during destroy', async () => {
    Room.findAll.mockResolvedValue([mockRoom]);
    Room.destroy.mockRejectedValue(new Error('Destroy error'));

    await expect(deleteRoomController('123')).rejects.toThrow('Destroy error');
  });

  test('should handle multiple rooms with same id', async () => {
    Room.findAll.mockResolvedValue([mockRoom, mockRoom]);
    Room.destroy.mockResolvedValue(2);

    const result = await deleteRoomController('123');

    expect(Room.destroy).toHaveBeenCalledWith({ where: { id: '123' } });
    expect(result).toEqual({ message: 'Deleted' });
  });
});
