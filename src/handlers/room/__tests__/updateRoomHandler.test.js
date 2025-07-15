const updateRoomHandler = require('../updateRoomHandler');
const { Room } = require('../../../models');
const updateRoomController = require('../../../controllers/room/updateRoomController');
const uploadImageController = require('../../../controllers/image/uploadImageController');

jest.mock('../../../models');
jest.mock('../../../controllers/room/updateRoomController');
jest.mock('../../../controllers/image/uploadImageController');

describe('updateRoomHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRoom = {
    id: '123',
    price: 100,
    photoRoom: ['existing-photo.jpg']
  };

  test('should handle empty request files', async () => {
    const mockReq = {
      params: { id: '123' },
      body: { price: '150' },
      files: []
    };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    Room.findByPk.mockResolvedValue(mockRoom);
    updateRoomController.mockResolvedValue({ ...mockRoom, price: 150 });

    await updateRoomHandler(mockReq, mockRes);

    expect(Room.findByPk).toHaveBeenCalledWith('123');
    expect(updateRoomController).toHaveBeenCalledWith('123', expect.objectContaining({
      price: 150,
      photoRoom: ['existing-photo.jpg']
    }));
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test('should handle new photo uploads', async () => {
    const mockReq = {
      params: { id: '123' },
      body: { price: '150' },
      files: [{ path: 'new-photo.jpg' }]
    };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    Room.findByPk.mockResolvedValue(mockRoom);
    uploadImageController.mockResolvedValue({ secure_url: 'new-uploaded-photo.jpg' });
    updateRoomController.mockResolvedValue({ 
      ...mockRoom, 
      price: 150, 
      photoRoom: ['existing-photo.jpg', 'new-uploaded-photo.jpg'] 
    });

    await updateRoomHandler(mockReq, mockRes);

    expect(uploadImageController).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'new-photo.jpg' }),
      'aremar/rooms'
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test('should handle invalid price input', async () => {
    const mockReq = {
      params: { id: '123' },
      body: { price: 'invalid' },
      files: []
    };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    Room.findByPk.mockResolvedValue(mockRoom);

    await updateRoomHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'El precio es obligatorio y debe ser un número válido.'
    });
  });

  test('should handle existing photos from JSON string', async () => {
    const mockReq = {
      params: { id: '123' },
      body: { 
        price: '150',
        existingPhotos: JSON.stringify(['photo1.jpg', 'photo2.jpg'])
      },
      files: []
    };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    Room.findByPk.mockResolvedValue(mockRoom);
    updateRoomController.mockResolvedValue({
      ...mockRoom,
      price: 150,
      photoRoom: ['photo1.jpg', 'photo2.jpg']
    });

    await updateRoomHandler(mockReq, mockRes);

    expect(updateRoomController).toHaveBeenCalledWith('123', expect.objectContaining({
      photoRoom: ['photo1.jpg', 'photo2.jpg']
    }));
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test('should handle room not found', async () => {
    const mockReq = {
      params: { id: '123' },
      body: { price: '150' },
      files: []
    };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    Room.findByPk.mockResolvedValue(null);

    await updateRoomHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Room not found' });
  });
});
