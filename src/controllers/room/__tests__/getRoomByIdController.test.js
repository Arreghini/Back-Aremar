

const getRoomByIdController = require('../../../controllers/room/getRoomByIdController');
const { Room, RoomType, RoomDetail } = require('../../../models');

jest.mock('../../../models', () => ({
  Room: {
    findByPk: jest.fn(),
  },
  RoomType: jest.fn(),
  RoomDetail: jest.fn(),
}));

describe('getRoomByIdController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lanza error si id no es string', async () => {
    await expect(getRoomByIdController(123)).rejects.toThrow('Room ID must be a string');
  });

  it('lanza error si id es string vacío', async () => {
    await expect(getRoomByIdController('  ')).rejects.toThrow('Room ID is required');
  });

  it('retorna room si existe', async () => {
    const mockRoom = { id: 'abc123', name: 'Room 1' };
    Room.findByPk.mockResolvedValue(mockRoom);

    const result = await getRoomByIdController('abc123');

    expect(Room.findByPk).toHaveBeenCalledWith('abc123', {
      include: [
        { model: RoomType, as: 'roomType' },
        { model: RoomDetail, as: 'roomDetail' },
      ],
    });
    expect(result).toEqual(mockRoom);
  });

  it('retorna null si room no existe', async () => {
    Room.findByPk.mockResolvedValue(null);

    const result = await getRoomByIdController('nonexistent');

    expect(result).toBeNull();
  });

  it('lanza error si findByPk falla', async () => {
    Room.findByPk.mockRejectedValue(new Error('DB failure'));

    await expect(getRoomByIdController('abc123')).rejects.toThrow('DB failure');
  });
});
