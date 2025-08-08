// ✅ Importa la implementación real
const { handleSaveUser } = require('../userHandler');

// Mock de las dependencias que sí se usan internamente
jest.mock('../../../controllers/user/userController', () => ({
  saveUser: jest.fn().mockResolvedValue({ id: '123', name: 'Test User' })
}));

jest.mock('../../../services/roleService', () => ({
  getManagementApiToken: jest.fn().mockResolvedValue('fake-management-token'),
  checkUserRole: jest.fn().mockResolvedValue(true)
}));

const userController = require('../../../controllers/user/userController');
const roleService = require('../../../services/roleService');

describe('handleSaveUser', () => {
  it('✅ should call saveUser with correct userData and return result with isAdmin', async () => {
    const mockReq = {
      user: { sub: 'auth0|user123' },
      headers: { authorization: 'Bearer fake-token' }
    };

    const result = await handleSaveUser(mockReq);

    expect(userController.saveUser).toHaveBeenCalledWith({
      user_id: 'auth0|user123',
      authorization: 'Bearer fake-token'
    });

    expect(roleService.getManagementApiToken).toHaveBeenCalled();
    expect(roleService.checkUserRole).toHaveBeenCalledWith('auth0|user123', 'fake-management-token');

    expect(result).toEqual({
      id: '123',
      name: 'Test User',
      isAdmin: true
    });
  });

  it('❌ should throw an error if user_id is missing (no sub or body)', async () => {
    const mockReq = {
      user: {}, // no sub
      body: {}, // existe pero vacío
      headers: { authorization: 'Bearer fake-token' }
    };

    await expect(handleSaveUser(mockReq)).rejects.toThrow('No se pudo obtener el user_id del usuario');
  });

  it('❌ should throw an error if req.user is undefined', async () => {
    const mockReq = {
      body: { auth0Id: 'auth0|123456' },
      headers: { authorization: 'Bearer fake-token' }
      // no hay req.user
    };

    await expect(handleSaveUser(mockReq)).rejects.toThrow('Usuario no autenticado');
  });
});
