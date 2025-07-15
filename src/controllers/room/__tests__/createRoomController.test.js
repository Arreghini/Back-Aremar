const { Room, RoomDetail, RoomType } = require('../../../models');
const createRoomController = require('../createRoomController');

jest.mock('../../../models', () => ({
  Room: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn()
  },
  RoomDetail: {
    create: jest.fn()
  },
  RoomType: {}
}));

describe('createRoomController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRoomData = {
    description: 'Test Room',
    roomTypeId: 'TYPE-001',
    price: '100.50',
    roomDetails: JSON.stringify({
      cableTvService: true,
      smart_TV: true,
      wifi: true,
      microwave: false,
      pava_electrica: true
    })
  };

  test('should create room with auto-generated ID when no ID provided', async () => {
    const mockCreatedRoom = { id: 'ROOM-123456', ...mockRoomData };
    const mockRoomDetail = { id: 'DETAIL-001' };
    
    Room.create.mockResolvedValue(mockCreatedRoom);
    RoomDetail.create.mockResolvedValue(mockRoomDetail);
    Room.findByPk.mockResolvedValue({ ...mockCreatedRoom, roomDetail: mockRoomDetail });

    const result = await createRoomController(mockRoomData);

    expect(Room.create).toHaveBeenCalled();
    expect(result.id).toMatch(/^ROOM-\d{6}$/);
  });

  test('should handle duplicate room ID by appending counter', async () => {
    const dataWithId = { ...mockRoomData, id: 'ROOM-001' };
    Room.findOne
      .mockResolvedValueOnce({ id: 'ROOM-001' })
      .mockResolvedValueOnce({ id: 'ROOM-001-1' })
      .mockResolvedValueOnce(null);
    
    Room.create.mockResolvedValue({ id: 'ROOM-001-2', ...mockRoomData });
    RoomDetail.create.mockResolvedValue({ id: 'DETAIL-001' });
    Room.findByPk.mockResolvedValue({ id: 'ROOM-001-2', ...mockRoomData });

    const result = await createRoomController(dataWithId);

    expect(result.id).toBe('ROOM-001-2');
  });

  test('should throw error for invalid price', async () => {
    const invalidData = { ...mockRoomData, price: 'invalid' };

    await expect(createRoomController(invalidData))
      .rejects
      .toThrow('El precio debe ser un número válido');
  });

  test('should throw error for missing description', async () => {
    const invalidData = { ...mockRoomData, description: '' };

    await expect(createRoomController(invalidData))
      .rejects
      .toThrow('La descripción es requerida');
  });

  test('should throw error for missing roomTypeId', async () => {
    const invalidData = { ...mockRoomData, roomTypeId: null };

    await expect(createRoomController(invalidData))
      .rejects
      .toThrow('El tipo de habitación es requerido');
  });

  test('should handle invalid roomDetails JSON', async () => {
    const invalidData = { ...mockRoomData, roomDetails: 'invalid json' };

    await expect(createRoomController(invalidData))
      .rejects
      .toThrow('Los detalles de la habitación no tienen un formato JSON válido');
  });

  test('should create room with default status when not provided', async () => {
    Room.create.mockImplementation(data => data);
    RoomDetail.create.mockResolvedValue({ id: 'DETAIL-001' });
    Room.findByPk.mockResolvedValue({ ...mockRoomData, status: 'available' });

    const result = await createRoomController(mockRoomData);

    expect(Room.create).toHaveBeenCalledWith(expect.objectContaining({
      status: 'available'
    }));
  });
});
