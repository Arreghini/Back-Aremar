const { User } = require('../../../models');
const updateGuestProfileController = require('../updateProfileController');

jest.mock('../../../models', () => ({
  User: {
    findByPk: jest.fn()
  }
}));

describe('updateGuestProfileController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
describe('User model import', () => {
 test('should throw error when models module is not found', () => {
  jest.resetModules();

  jest.doMock('../../../models', () => {
    return {
      get User() {
        throw new Error('Cannot find module');
      }
    };
  });

  expect(() => {
    require('../updateProfileController');
  }).toThrow('Cannot find module');
});
  });

  test('should throw error when User model is not defined in models', () => {
    jest.isolateModules(() => {
      jest.mock('../../../models', () => ({}));
      
      expect(() => {
        require('../updateProfileController');
      }).toThrow();
    });

  test('should successfully import User model with correct structure', () => {
    const { User } = require('../../../models');
    expect(User).toBeDefined();
    expect(User.findByPk).toBeDefined();
    expect(typeof User.findByPk).toBe('function');
  });

  test('should maintain User model reference after multiple imports', () => {
    const firstImport = require('../../../models').User;
    const secondImport = require('../../../models').User;
    expect(firstImport).toBe(secondImport);
  });
});
