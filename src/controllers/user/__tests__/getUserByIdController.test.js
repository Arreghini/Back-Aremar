const { User } = require('../../../models');
const userGetByIdController = require('../getUserByIdController');

jest.mock('../../../models', () => ({
  User: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
}));

describe('userGetByIdController', () => {
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
    isActive: true,
  };

  test('should get user by ID successfully', async () => {
    User.findByPk.mockResolvedValue(mockUser);

    const result = await userGetByIdController('123');

    expect(User.findByPk).toHaveBeenCalledWith('123');
    expect(result).toEqual(mockUser);
  });

  test('should return null if user does not exist', async () => {
    User.findByPk.mockResolvedValue(null);

    const result = await userGetByIdController('123');

    expect(User.findByPk).toHaveBeenCalledWith('123');
    expect(result).toBeNull();
  });

  test('should throw error if user ID is not provided', async () => {
    await expect(userGetByIdController())
      .rejects
      .toThrow('User ID is required');

    expect(User.findByPk).not.toHaveBeenCalled();
  });

  test('should handle database errors during user retrieval', async () => {
    User.findByPk.mockRejectedValue(new Error('Database error'));

    await expect(userGetByIdController('123'))
      .rejects
      .toThrow('Database error');
  });

  test('should return null for invalid user ID format', async () => {
    User.findByPk.mockResolvedValue(null);

    const result = await userGetByIdController('invalid-id');

    expect(User.findByPk).toHaveBeenCalledWith('invalid-id');
    expect(result).toBeNull();
  });
});
