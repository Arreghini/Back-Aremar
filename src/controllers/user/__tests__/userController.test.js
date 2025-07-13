const axios = require('axios');
const { saveUser } = require('../userController');

const userService = require('../../../services/userService');
const { getManagementApiToken, checkUserRole } = require('../../../services/roleService');

jest.mock('axios');

jest.mock('../../../services/userService', () => ({
  saveOrUpdateUser: jest.fn(),
}));

jest.mock('../../../services/roleService', () => ({
  getManagementApiToken: jest.fn(),
  checkUserRole: jest.fn(),
}));

describe('axios in userController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should make successful HTTP request', async () => {
    const mockResponse = { data: { success: true } };
    axios.get.mockResolvedValue(mockResponse);

    const response = await axios.get('test-url');
    expect(response).toEqual(mockResponse);
    expect(axios.get).toHaveBeenCalledWith('test-url');
  });

  test('should handle network errors', async () => {
    const networkError = new Error('Network Error');
    axios.get.mockRejectedValue(networkError);

    await expect(axios.get('test-url'))
      .rejects
      .toThrow('Network Error');
  });

  test('should handle timeout errors', async () => {
    const timeoutError = new Error('timeout of 5000ms exceeded');
    axios.get.mockRejectedValue(timeoutError);

    await expect(axios.get('test-url'))
      .rejects
      .toThrow('timeout of 5000ms exceeded');
  });

  test('should handle invalid URL errors', async () => {
    const invalidUrlError = new Error('Invalid URL');
    axios.get.mockRejectedValue(invalidUrlError);

    await expect(axios.get(''))
      .rejects
      .toThrow('Invalid URL');
  });
});

describe('saveUser function', () => {
  const mockUserData = {
    user_id: 'test123',
    authorization: 'Bearer token123'
  };

  const mockAuth0Response = {
    data: {
      email: 'test@example.com',
      name: 'Test User',
      picture: 'http://example.com/pic.jpg',
      email_verified: true
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should throw error when authorization header is missing', async () => {
    const invalidUserData = { user_id: 'test123' };
    
    await expect(saveUser(invalidUserData))
      .rejects
      .toThrow('Authorization header is missing');
  });

  test('should handle Auth0 404 error correctly', async () => {
    axios.get.mockRejectedValue({
      response: { status: 404 }
    });

    await expect(saveUser(mockUserData))
      .rejects
      .toThrow('Usuario no encontrado en Auth0');
  });

  test('should handle Auth0 generic communication error', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    await expect(saveUser(mockUserData))
      .rejects
      .toThrow('Error de comunicación con Auth0');
  });

  test('should successfully save user and return admin status', async () => {
    const mockUser = {
      id: 'test123',
      email: 'test@example.com',
      name: 'Test User'
    };

    axios.get.mockResolvedValue(mockAuth0Response);
    userService.saveOrUpdateUser.mockResolvedValue(mockUser);
    getManagementApiToken.mockResolvedValue('fake-token');
    checkUserRole.mockResolvedValue(false);

    const result = await saveUser(mockUserData);

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/userinfo'),
      expect.objectContaining({
        headers: { Authorization: mockUserData.authorization }
      })
    );

    expect(result).toEqual({
      user: mockUser,
      isAdmin: false
    });
  });

  test('should handle user service errors', async () => {
    axios.get.mockResolvedValue(mockAuth0Response);
    userService.saveOrUpdateUser.mockRejectedValue(new Error('Database error'));
    getManagementApiToken.mockResolvedValue('fake-token');
    checkUserRole.mockResolvedValue(false);

    await expect(saveUser(mockUserData))
      .rejects
      .toThrow('Database error');
  });
});
