
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

describe('handleSaveUser', () => {
  it('❌ should throw an error if user_id is missing', async () => {
    const mockReq = {
      user: {}, // no hay 'sub'
      body: {}, // 👈 necesario para evitar el error de lectura
      headers: { authorization: 'Bearer fake-token' }
    };

    // Este test espera que se lance un error con ese mensaje
    await expect(handleSaveUser(mockReq)).rejects.toThrow('No se pudo obtener el user_id del usuario');
  });
});

  it('❌ should throw an error if user_id is missing', async () => {
    const mockReq = {
      user: {},
      headers: { authorization: 'Bearer fake-token' }
    };

    await expect(handleSaveUser(mockReq)).rejects.toThrow('No se pudo obtener el user_id del usuario');
  });
});
