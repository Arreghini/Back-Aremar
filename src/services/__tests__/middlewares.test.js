// 🧼 MOCKS PRIMERO
jest.mock('jwks-rsa', () => {
  return jest.fn(() => ({
    getSigningKey: (kid, callback) => {
      const key = {
        publicKey: 'fakePublicKey',
        rsaPublicKey: 'fakeRSAPublicKey',
      };
      callback(null, key);
    },
  }));
});

jest.mock('axios');

// 👇 LUEGO se importa el middleware (una vez que los mocks están listos)
const { checkAdmin } = require('../middlewares');

describe('checkAdmin middleware', () => {
  let req, res, next, consoleErrorSpy;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer fakeToken',
      },
      user: {
        sub: 'user123',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    
    // Silenciar console.error para evitar ruido en los tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  afterAll(() => {
    jest.restoreAllMocks(); // 👈 libera recursos al final
  });

  it('debería llamar a next() si el usuario tiene el rol de administrador', async () => {
    const axios = require('axios');
    axios.post.mockResolvedValue({ data: { access_token: 'managementToken' } });
    axios.get.mockResolvedValue({ data: [{ name: 'admin' }] });

    await checkAdmin(req, res, next);

    expect(axios.post).toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('debería devolver 403 si el usuario no tiene el rol de administrador', async () => {
    const axios = require('axios');
    axios.post.mockResolvedValue({ data: { access_token: 'managementToken' } });
    axios.get.mockResolvedValue({ data: [{ name: 'user' }] });

    await checkAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Acceso denegado: Se requiere rol de administrador',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería devolver 500 si ocurre un error interno', async () => {
    const axios = require('axios');
    axios.post.mockRejectedValue(new Error('falló'));

    await checkAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error interno del servidor',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
