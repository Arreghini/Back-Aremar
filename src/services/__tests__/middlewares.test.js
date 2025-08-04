const axios = require('axios');
const jwt = require('jsonwebtoken');
const { checkAdmin } = require('../../services/middlewares');
jest.mock('axios');
jest.mock('jsonwebtoken');

describe('checkAdmin middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer fakeToken',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería llamar a next() si el usuario tiene el rol de administrador', async () => {
    const decodedToken = {
      sub: 'user123',
    };

    const userData = {
      data: {
        roles: ['admin'],
      },
    };

    jwt.decode.mockReturnValue(decodedToken);
    axios.get.mockResolvedValue(userData);

    await checkAdmin(req, res, next);

    expect(jwt.decode).toHaveBeenCalledWith('fakeToken');
    expect(axios.get).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('debería devolver 403 si el usuario no tiene el rol de administrador', async () => {
    const decodedToken = {
      sub: 'user456',
    };

    const userData = {
      data: {
        roles: ['user'],
      },
    };

    jwt.decode.mockReturnValue(decodedToken);
    axios.get.mockResolvedValue(userData);

    await checkAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Acceso denegado: rol de administrador requerido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería devolver 401 si no hay token', async () => {
    req.headers.authorization = null;

    await checkAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No se proporcionó token de autenticación' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería devolver 500 si ocurre un error interno', async () => {
    jwt.decode.mockImplementation(() => { throw new Error('Error interno'); });

    await checkAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error al validar el rol de administrador' });
    expect(next).not.toHaveBeenCalled();
  });
});
