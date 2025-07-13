const { User } = require('../../../models');
const userDeleteController = require('../deleteUserController');

jest.mock('../../../models', () => ({
  User: {
    findByPk: jest.fn(),
    destroy: jest.fn()
  }
}));

describe('userDeleteController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: '123',
    name: 'Test User',
    email: 'test@test.com',
    destroy: jest.fn()
  };

  test('should delete an existing user successfully', async () => {
    User.findByPk.mockResolvedValue(mockUser);
    User.destroy.mockResolvedValue(1);

    const result = await userDeleteController('123');
    
    expect(User.findByPk).toHaveBeenCalledWith('123');
    expect(User.destroy).toHaveBeenCalledWith({ where: { id: '123' } });
    expect(result).toBe(true);
  });

  test('should throw error if user does not exist', async () => {
    User.findByPk.mockResolvedValue(null);

    await expect(userDeleteController('123'))
      .rejects
      .toThrow('User not found');
    
    expect(User.destroy).not.toHaveBeenCalled();
  });

  test('should handle database errors during user deletion', async () => {
    User.findByPk.mockResolvedValue(mockUser);
    User.destroy.mockRejectedValue(new Error('Database error'));

    await expect(userDeleteController('123'))
      .rejects
      .toThrow('Database error');
  });

  test('should throw error if user ID is not provided', async () => {
    await expect(userDeleteController())
      .rejects
      .toThrow('User ID is required');
    
    expect(User.findByPk).not.toHaveBeenCalled();
    expect(User.destroy).not.toHaveBeenCalled();
  });
});
