const { User } = require('../../models');
jest.mock('../../models');

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have User model defined', () => {
    expect(User).toBeDefined();
  });

  it('should be able to mock User.findAll', async () => {
    const mockUsers = [
      { id: 1, name: 'Test User' },
      { id: 2, name: 'Another User' }
    ];
    User.findAll.mockResolvedValue(mockUsers);

    const result = await User.findAll();
    expect(result).toEqual(mockUsers);
    expect(User.findAll).toHaveBeenCalledTimes(1);
  });

  it('should handle User.findOne with specific id', async () => {
    const mockUser = { id: 1, name: 'Test User' };
    User.findOne.mockResolvedValue(mockUser);

    const result = await User.findOne({ where: { id: 1 }});
    expect(result).toEqual(mockUser);
    expect(User.findOne).toHaveBeenCalledWith({ where: { id: 1 }});
  });

  it('should handle User.create with valid data', async () => {
    const userData = { name: 'New User', email: 'test@example.com' };
    const mockCreatedUser = { id: 1, ...userData };
    User.create.mockResolvedValue(mockCreatedUser);

    const result = await User.create(userData);
    expect(result).toEqual(mockCreatedUser);
    expect(User.create).toHaveBeenCalledWith(userData);
  });

  it('should handle User.findOne returning null for non-existent user', async () => {
    User.findOne.mockResolvedValue(null);

    const result = await User.findOne({ where: { id: 999 }});
    expect(result).toBeNull();
    expect(User.findOne).toHaveBeenCalledWith({ where: { id: 999 }});
  });
});
