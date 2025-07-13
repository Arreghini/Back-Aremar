const getUserByIdHandler = require('../../../handlers/user/getUserByIdHandler');
const getUserByIdController = require('../../../controllers/user/getUserByIdController');

jest.mock('../../../controllers/user/getUserByIdController');

describe('getUserByIdHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: '123',
    name: 'Test User',
    email: 'test@test.com',
    verifyedEmail: true,
    picture: 'test.jpg',
    phone: '1234567890',
    dni: '12345678',
    address: 'Test Address',
    isActive: true
  };

  test('should call getUserByIdController with correct ID', async () => {
    const mockReq = {
      params: { id: '123' }
    };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    getUserByIdController.mockResolvedValue(mockUser);

    await getUserByIdHandler(mockReq, mockRes);

    expect(getUserByIdController).toHaveBeenCalledWith('123');
    expect(mockRes.json).toHaveBeenCalledWith(mockUser);
  });

  test('should handle controller errors with 500 status', async () => {
    const mockReq = {
      params: { id: '123' }
    };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    getUserByIdController.mockRejectedValue(new Error('Controller error'));

    await getUserByIdHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Controller error' });
  });

  test('should handle missing ID parameter', async () => {
    const mockReq = {
      params: {}
    };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await getUserByIdHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'User ID is required' });
  });

  test('should handle user not found with 404 status', async () => {
    const mockReq = {
      params: { id: '123' }
    };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    getUserByIdController.mockResolvedValue(null); // <--- corrección acá

    await getUserByIdHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
  });
});
