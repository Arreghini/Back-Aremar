const { User } = require('../../../models');
const userUpdateController = require('../updateUserController');

jest.mock('../../../models', () => ({
  User: {
    findByPk: jest.fn()
  }
}));

describe('userUpdateController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const updateData = {
    name: 'Updated User',
    phone: '0987654321'
  };

  const mockUser = {
    id: '123',
    name: 'Test User',
    email: 'test@test.com',
    update: jest.fn().mockResolvedValue(true) // ✅ .update está en la instancia
  };

  test('should update an existing user successfully', async () => {
    User.findByPk.mockResolvedValue(mockUser);

    const result = await userUpdateController('123', updateData);

    expect(User.findByPk).toHaveBeenCalledWith('123');
    expect(mockUser.update).toHaveBeenCalledWith(updateData);
    expect(result).toBe(mockUser); // Retorna el usuario actualizado
  });

  test('should throw error if user does not exist', async () => {
    User.findByPk.mockResolvedValue(null);

    await expect(userUpdateController('123', updateData))
      .rejects
      .toThrow('Usuario no encontrado');
    
    expect(User.findByPk).toHaveBeenCalledWith('123');
  });

  test('should handle database errors during update', async () => {
    const mockUserWithError = {
      update: jest.fn().mockRejectedValue(new Error('Database error'))
    };
    User.findByPk.mockResolvedValue(mockUserWithError);

    await expect(userUpdateController('123', updateData))
      .rejects
      .toThrow('Database error');
  });

  test('should throw error if no update data is provided', async () => {
    await expect(userUpdateController('123', {}))
      .rejects
      .toThrow('ID y datos de actualización son requeridos');
    
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  test('should throw error if user ID is not provided', async () => {
    await expect(userUpdateController(null, updateData))
      .rejects
      .toThrow('ID y datos de actualización son requeridos');
    
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  test('should handle invalid update fields', async () => {
    const invalidUpdateData = {
      invalidField: 'test',
      anotherInvalidField: true
    };

    const mockUserInvalid = {
      update: jest.fn().mockRejectedValue(new Error('Invalid fields'))
    };

    User.findByPk.mockResolvedValue(mockUserInvalid);

    await expect(userUpdateController('123', invalidUpdateData))
      .rejects
      .toThrow('Invalid fields');
  });
});
