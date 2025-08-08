

jest.mock('../../../models', () => ({
  User: {
    findByPk: jest.fn()
  }
}));

describe('updateGuestProfileController', () => {
  const { User } = require('../../../models');
  const updateGuestProfileController = require('../updateProfileController');

  const mockUser = {
    id: '123',
    name: 'Test User',
    email: 'test@test.com',
    update: jest.fn()
  };

  const fieldsToUpdate = {
    name: 'Updated User',
    email: 'updated@test.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should update user profile successfully', async () => {
    mockUser.update.mockResolvedValue({ ...mockUser, ...fieldsToUpdate });
    User.findByPk.mockResolvedValue(mockUser);

    const result = await updateGuestProfileController('123', fieldsToUpdate);

    expect(User.findByPk).toHaveBeenCalledWith('123');
    expect(mockUser.update).toHaveBeenCalledWith(fieldsToUpdate);
    expect(result).toEqual({ ...mockUser, ...fieldsToUpdate });
  });

  test('should throw error if user ID is not found', async () => {
    User.findByPk.mockResolvedValue(null);

    await expect(updateGuestProfileController('123', fieldsToUpdate))
      .rejects
      .toThrow('User not found');

    expect(mockUser.update).not.toHaveBeenCalled();
  });

  test('should handle database error during user lookup', async () => {
    User.findByPk.mockRejectedValue(new Error('Database connection error'));

    await expect(updateGuestProfileController('123', fieldsToUpdate))
      .rejects
      .toThrow('Database connection error');
  });

  test('should handle database error during update', async () => {
    User.findByPk.mockResolvedValue(mockUser);
    mockUser.update.mockRejectedValue(new Error('Update failed'));

    await expect(updateGuestProfileController('123', fieldsToUpdate))
      .rejects
      .toThrow('Update failed');
  });

  test('should handle empty update fields', async () => {
    mockUser.update.mockResolvedValue(mockUser);
    User.findByPk.mockResolvedValue(mockUser);

    const result = await updateGuestProfileController('123', {});

    expect(User.findByPk).toHaveBeenCalledWith('123');
    expect(mockUser.update).toHaveBeenCalledWith({});
    expect(result).toEqual(mockUser);
  });
});
