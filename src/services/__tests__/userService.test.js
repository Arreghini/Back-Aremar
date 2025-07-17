const { User } = require('../../models');
const { saveOrUpdateUser } = require('../userService');

jest.mock('../../models', () => ({
  User: {
    findOrCreate: jest.fn(),
  }
}));

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveOrUpdateUser', () => {
    const mockUserData = {
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      emailVerified: true,
      picture: 'https://example.com/avatar.jpg',
      phone: '+1234567890',
      dni: '12345678',
      address: '123 Main St',
      isActive: true,
    };

    it('should create a new user when user does not exist', async () => {
      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        email_verified: true,
        picture: 'https://example.com/avatar.jpg',
        phone: '+1234567890',
        dni: '12345678',
        address: '123 Main St',
        isActive: true,
      };

      User.findOrCreate.mockResolvedValue([mockUser, true]);

      const result = await saveOrUpdateUser(mockUserData);

      expect(result).toEqual(mockUser);
      expect(User.findOrCreate).toHaveBeenCalledWith({
        where: { id: 'user123' },
        defaults: {
          email: 'john@example.com',
          name: 'John Doe',
          picture: 'https://example.com/avatar.jpg',
          email_verified: true,
          phone: '+1234567890',
          dni: '12345678',
          address: '123 Main St',
          isActive: true,
        },
      });
    });

    it('should update existing user when user already exists', async () => {
      const existingUser = {
        id: 'user123',
        name: 'Old Name',
        email: 'old@example.com',
        update: jest.fn(),
      };

      const updatedUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        email_verified: true,
        picture: 'https://example.com/avatar.jpg',
        phone: '+1234567890',
        dni: '12345678',
        address: '123 Main St',
        isActive: true,
      };

      existingUser.update.mockResolvedValue(updatedUser);
      User.findOrCreate.mockResolvedValue([existingUser, false]);

      const result = await saveOrUpdateUser(mockUserData);

      expect(result).toEqual(updatedUser);
      expect(existingUser.update).toHaveBeenCalledWith({
        email: 'john@example.com',
        name: 'John Doe',
        picture: 'https://example.com/avatar.jpg',
        email_verified: true,
        phone: '+1234567890',
        dni: '12345678',
        address: '123 Main St',
        isActive: true,
      });
    });

    it('should throw error when id is not provided', async () => {
      const invalidData = { ...mockUserData, id: undefined };

      await expect(saveOrUpdateUser(invalidData)).rejects.toThrow(
        'Error al guardar o actualizar el usuario'
      );
    });

    it('should throw error when id is empty string', async () => {
      const invalidData = { ...mockUserData, id: '' };

      await expect(saveOrUpdateUser(invalidData)).rejects.toThrow(
        'Error al guardar o actualizar el usuario'
      );
    });

    it('should throw error when id is null', async () => {
      const invalidData = { ...mockUserData, id: null };

      await expect(saveOrUpdateUser(invalidData)).rejects.toThrow(
        'Error al guardar o actualizar el usuario'
      );
    });

    it('should handle database errors during findOrCreate', async () => {
      User.findOrCreate.mockRejectedValue(new Error('Database connection failed'));

      await expect(saveOrUpdateUser(mockUserData)).rejects.toThrow(
        'Error al guardar o actualizar el usuario'
      );
    });

    it('should handle database errors during update', async () => {
      const existingUser = {
        id: 'user123',
        name: 'Old Name',
        email: 'old@example.com',
        update: jest.fn(),
      };

      existingUser.update.mockRejectedValue(new Error('Update failed'));
      User.findOrCreate.mockResolvedValue([existingUser, false]);

      await expect(saveOrUpdateUser(mockUserData)).rejects.toThrow(
        'Error al guardar o actualizar el usuario'
      );
    });

    it('should handle partial user data', async () => {
      const partialData = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        // Missing other fields
      };

      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        email_verified: undefined,
        picture: undefined,
        phone: undefined,
        dni: undefined,
        address: undefined,
        isActive: undefined,
      };

      User.findOrCreate.mockResolvedValue([mockUser, true]);

      const result = await saveOrUpdateUser(partialData);

      expect(result).toEqual(mockUser);
      expect(User.findOrCreate).toHaveBeenCalledWith({
        where: { id: 'user123' },
        defaults: {
          email: 'john@example.com',
          name: 'John Doe',
          picture: undefined,
          email_verified: undefined,
          phone: undefined,
          dni: undefined,
          address: undefined,
          isActive: undefined,
        },
      });
    });

    it('should handle emailVerified false value', async () => {
      const userData = {
        ...mockUserData,
        emailVerified: false,
      };

      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        email_verified: false,
        picture: 'https://example.com/avatar.jpg',
        phone: '+1234567890',
        dni: '12345678',
        address: '123 Main St',
        isActive: true,
      };

      User.findOrCreate.mockResolvedValue([mockUser, true]);

      const result = await saveOrUpdateUser(userData);

      expect(result).toEqual(mockUser);
      expect(User.findOrCreate).toHaveBeenCalledWith({
        where: { id: 'user123' },
        defaults: {
          email: 'john@example.com',
          name: 'John Doe',
          picture: 'https://example.com/avatar.jpg',
          email_verified: false,
          phone: '+1234567890',
          dni: '12345678',
          address: '123 Main St',
          isActive: true,
        },
      });
    });

    it('should handle isActive false value', async () => {
      const userData = {
        ...mockUserData,
        isActive: false,
      };

      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        email_verified: true,
        picture: 'https://example.com/avatar.jpg',
        phone: '+1234567890',
        dni: '12345678',
        address: '123 Main St',
        isActive: false,
      };

      User.findOrCreate.mockResolvedValue([mockUser, true]);

      const result = await saveOrUpdateUser(userData);

      expect(result).toEqual(mockUser);
      expect(User.findOrCreate).toHaveBeenCalledWith({
        where: { id: 'user123' },
        defaults: {
          email: 'john@example.com',
          name: 'John Doe',
          picture: 'https://example.com/avatar.jpg',
          email_verified: true,
          phone: '+1234567890',
          dni: '12345678',
          address: '123 Main St',
          isActive: false,
        },
      });
    });

    it('should handle update with all fields undefined', async () => {
      const existingUser = {
        id: 'user123',
        update: jest.fn(),
      };

      const updatedUser = {
        id: 'user123',
        name: undefined,
        email: undefined,
        email_verified: undefined,
        picture: undefined,
        phone: undefined,
        dni: undefined,
        address: undefined,
        isActive: undefined,
      };

      existingUser.update.mockResolvedValue(updatedUser);
      User.findOrCreate.mockResolvedValue([existingUser, false]);

      const result = await saveOrUpdateUser({ id: 'user123' });

      expect(result).toEqual(updatedUser);
      expect(existingUser.update).toHaveBeenCalledWith({
        email: undefined,
        name: undefined,
        picture: undefined,
        email_verified: undefined,
        phone: undefined,
        dni: undefined,
        address: undefined,
        isActive: undefined,
      });
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle User model being undefined', async () => {
      // Temporarily mock User as undefined
      const originalUser = User;
      User.findOrCreate = undefined;

      await expect(saveOrUpdateUser({ id: 'user123' })).rejects.toThrow(
        'Error al guardar o actualizar el usuario'
      );

      // Restore original User
      User.findOrCreate = originalUser.findOrCreate;
    });

    it('should handle empty object input', async () => {
      await expect(saveOrUpdateUser({})).rejects.toThrow(
        'Error al guardar o actualizar el usuario'
      );
    });

    it('should handle null input', async () => {
      await expect(saveOrUpdateUser(null)).rejects.toThrow(
        'Cannot destructure property \'id\' of \'object null\' as it is null.'
      );
    });

    it('should handle undefined input', async () => {
      await expect(saveOrUpdateUser(undefined)).rejects.toThrow(
        'Cannot destructure property \'id\' of \'undefined\' as it is undefined.'
      );
    });
  });
});
