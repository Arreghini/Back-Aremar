const { User } = require('../../../models');
const userCreateController = require('../createUserController');

jest.mock('../../../models', () => ({
  User: {
    findByPk: jest.fn(),
    create: jest.fn()
  }
}));

describe('userCreateController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUserData = {
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

  test('should create a new user successfully', async () => {
    User.findByPk.mockResolvedValue(null);
    User.create.mockResolvedValue(mockUserData);

    const result = await userCreateController(mockUserData);

    expect(User.findByPk).toHaveBeenCalledWith('123');
    expect(User.create).toHaveBeenCalledWith(mockUserData);
    expect(result).toEqual(mockUserData);
  });

  test('should throw error if user with ID already exists', async () => {
    User.findByPk.mockResolvedValue(mockUserData);

    await expect(userCreateController(mockUserData))
      .rejects
      .toThrow('User with this ID already exists');
    
    expect(User.create).not.toHaveBeenCalled();
  });

  test('should handle database errors during user creation', async () => {
    User.findByPk.mockResolvedValue(null);
    User.create.mockRejectedValue(new Error('Database error'));

    await expect(userCreateController(mockUserData))
      .rejects
      .toThrow('Database error');
  });

  test('should handle missing required fields', async () => {
    const invalidUserData = {
      id: '123',
      name: 'Test User'
    };

    User.findByPk.mockResolvedValue(null);
    User.create.mockRejectedValue(new Error('Invalid user data'));

    await expect(userCreateController(invalidUserData))
      .rejects
      .toThrow('Invalid user data');
  });
});
