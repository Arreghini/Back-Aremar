const { Room } = require('../../../models');
const deleteRoomController = require('../deleteRoomController');

jest.mock('../../../models', () => ({
  Room: {
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
}));

const mockRoom = {
  id: '123',
  name: 'Test Room',
  capacity: 4,
  price: 100,
  isActive: true,
};

describe('deleteRoomController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should delete room successfully', async () => {
    Room.findAll.mockResolvedValue([mockRoom]);
    Room.destroy.mockResolvedValue(1);

    const result = await deleteRoomController('123');

    expect(Room.findAll).toHaveBeenCalledWith({ where: { id: '123' } });
    expect(Room.destroy).toHaveBeenCalledWith({ where: { id: '123' } });
    expect(result).toEqual([mockRoom]);
  });

  test('should return null when no id is provided', async () => {
    const result = await deleteRoomController();

    expect(Room.findAll).not.toHaveBeenCalled();
    expect(Room.destroy).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test('should return null when id is null', async () => {
    const result = await deleteRoomController(null);

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

  test('should handle multiple rooms with same id', async () => {
    const mockRooms = [
      { id: '123', name: 'Room 1', capacity: 2, price: 100, isActive: true },
      { id: '123', name: 'Room 2', capacity: 4, price: 200, isActive: false },
    ];
    Room.findAll.mockResolvedValue(mockRooms);
    Room.destroy.mockResolvedValue(2);

    const result = await deleteRoomController('123');

    expect(Room.findAll).toHaveBeenCalledWith({ where: { id: '123' } });
    expect(Room.destroy).toHaveBeenCalledWith({ where: { id: '123' } });
    expect(result).toEqual(mockRooms);
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
    Room.findAll.mockRejectedValue(new Error('Database error'));

    await expect(deleteRoomController('123')).rejects.toThrow('Database error');
    expect(Room.destroy).not.toHaveBeenCalled();
  });

  test('should handle database errors during destroy', async () => {
    Room.findAll.mockResolvedValue([mockRoom]);
    Room.destroy.mockRejectedValue(new Error('Delete error'));

    await expect(deleteRoomController('123')).rejects.toThrow('Delete error');
  });
});
