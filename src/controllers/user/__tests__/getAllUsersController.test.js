const { User } = require('../../../models');
const userGetAllController = require('../getAllUsersController');

jest.mock('../../../models', () => ({
  User: {
    findAll: jest.fn()
  }
}));

describe('userGetAllController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUsers = [
    {
      id: '123',
      name: 'Test User 1',
      email: 'test1@test.com',
      verifyedEmail: true,
      picture: 'test1.jpg',
      phone: '1234567890',
      dni: '12345678',
      address: 'Test Address 1',
      isActive: true
    },
    {
      id: '456',
      name: 'Test User 2',
      email: 'test2@test.com',
      verifyedEmail: false,
      picture: 'test2.jpg',
      phone: '0987654321',
      dni: '87654321',
      address: 'Test Address 2',
      isActive: true
    }
  ];

  test('should return all users successfully', async () => {
    User.findAll.mockResolvedValue(mockUsers);

    const result = await userGetAllController();

    expect(User.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
  });

  test('should return empty array when no users exist', async () => {
    User.findAll.mockResolvedValue([]);

    const result = await userGetAllController();

    expect(User.findAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test('should handle database errors', async () => {
    User.findAll.mockRejectedValue(new Error('Database error'));

    await expect(userGetAllController())
      .rejects
      .toThrow('Database error');
  });

  test('should apply filters when provided', async () => {
    const filters = { isActive: true };
    User.findAll.mockResolvedValue(mockUsers.filter(user => user.isActive));

    const result = await userGetAllController(filters);

    expect(User.findAll).toHaveBeenCalledWith({ where: filters });
    expect(result).toEqual(mockUsers.filter(user => user.isActive));
  });
});
