// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(() => ({
    parsed: {
      AUTH0_DOMAIN: 'test.auth0.com',
      AUTH0_CLIENT_ID: 'test-client-id',
      AUTH0_CLIENT_SECRET: 'test-client-secret',
      AUTH0_AUDIENCE: 'test-audience'
    }
  }))
}));

// Mock jwks-rsa
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

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

jest.mock('axios');

const { 
  loadEnv, 
  getManagementApiToken, 
  checkUserRole, 
  verifyToken, 
  jwtCheck, 
  checkAdmin 
} = require('../middlewares');

describe('loadEnv function', () => {
  it('debería cargar variables de entorno correctamente', () => {
    const dotenv = require('dotenv');
    const originalEnv = process.env;
    
    // Simular un entorno limpio
    process.env = {};
    
    loadEnv();
    
    expect(dotenv.config).toHaveBeenCalled();
    
    // Restaurar el entorno original
    process.env = originalEnv;
  });

  it('debería manejar cuando dotenv.config retorna null', () => {
    const dotenv = require('dotenv');
    const originalConfig = dotenv.config;
    
    // Mock dotenv.config to return null
    dotenv.config.mockReturnValue(null);
    
    expect(() => loadEnv()).not.toThrow();
    
    // Restore original mock
    dotenv.config.mockReturnValue({
      parsed: {
        AUTH0_DOMAIN: 'test.auth0.com',
        AUTH0_CLIENT_ID: 'test-client-id',
        AUTH0_CLIENT_SECRET: 'test-client-secret',
        AUTH0_AUDIENCE: 'test-audience'
      }
    });
  });
});

describe('getManagementApiToken function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería obtener un token de Management API exitosamente', async () => {
    const axios = require('axios');
    const mockToken = 'mock-management-token';
    axios.post.mockResolvedValue({ data: { access_token: mockToken } });

    const result = await getManagementApiToken();

    expect(axios.post).toHaveBeenCalledWith(
      'https://test.auth0.com/oauth/token',
      {
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
        audience: 'https://test.auth0.com/api/v2/',
        grant_type: 'client_credentials',
      }
    );
    expect(result).toBe(mockToken);
  });

  it('debería manejar errores al obtener el token', async () => {
    const axios = require('axios');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.post.mockRejectedValue(new Error('Network error'));

    await expect(getManagementApiToken()).rejects.toThrow('Error al obtener token del Management API');

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

describe('checkUserRole function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería retornar true si el usuario tiene rol de admin', async () => {
    const axios = require('axios');
    const mockToken = 'mock-token';
    const userId = 'user123';
    
    axios.get.mockResolvedValue({ 
      data: [{ name: 'admin' }, { name: 'user' }] 
    });

    const result = await checkUserRole(userId, mockToken);

    expect(axios.get).toHaveBeenCalledWith(
      'https://test.auth0.com/api/v2/users/user123/roles',
      {
        headers: {
          Authorization: 'Bearer mock-token',
        },
      }
    );
    expect(result).toBe(true);
  });

  it('debería retornar false si el usuario no tiene rol de admin', async () => {
    const axios = require('axios');
    const mockToken = 'mock-token';
    const userId = 'user123';
    
    axios.get.mockResolvedValue({ 
      data: [{ name: 'user' }, { name: 'moderator' }] 
    });

    const result = await checkUserRole(userId, mockToken);

    expect(result).toBe(false);
  });

  it('debería manejar errores al obtener roles', async () => {
    const axios = require('axios');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error('API error'));

    await expect(checkUserRole('user123', 'token')).rejects.toThrow('Error al obtener roles del usuario');

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('debería manejar errores cuando user_id es undefined', async () => {
    const axios = require('axios');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error('Invalid user ID'));

    await expect(checkUserRole(undefined, 'token')).rejects.toThrow('Error al obtener roles del usuario');

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

describe('getKey function', () => {
  it('debería obtener la clave de firma correctamente', (done) => {
    const jwksClient = require('jwks-rsa');
    const client = jwksClient();
    
    // Simular la función getKey que se pasa a jwt.verify
    const getKey = (header, callback) => {
      client.getSigningKey(header.kid, function (err, key) {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
      });
    };

    getKey({ kid: 'test-kid' }, (err, key) => {
      expect(err).toBeNull();
      expect(key).toBe('fakePublicKey');
      done();
    });
  });
});

describe('verifyToken function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería verificar un token válido exitosamente', async () => {
    const jwt = require('jsonwebtoken');
    const mockDecoded = { sub: 'user123', name: 'Test User' };
    
    jwt.verify.mockImplementation((token, getKey, options, callback) => {
      callback(null, mockDecoded);
    });

    const result = await verifyToken('valid-token');

    expect(jwt.verify).toHaveBeenCalledWith(
      'valid-token',
      expect.any(Function),
      {
        audience: 'test-audience',
        issuer: 'https://test.auth0.com/',
        algorithms: ['RS256'],
      },
      expect.any(Function)
    );
    expect(result).toEqual(mockDecoded);
  });

  it('debería rechazar un token inválido', async () => {
    const jwt = require('jsonwebtoken');
    const mockError = new Error('Invalid token');
    
    jwt.verify.mockImplementation((token, getKey, options, callback) => {
      callback(mockError, null);
    });

    await expect(verifyToken('invalid-token')).rejects.toThrow('Invalid token');
  });
});

describe('jwtCheck middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('debería verificar un token válido y llamar next()', async () => {
    const jwt = require('jsonwebtoken');
    const mockDecoded = { sub: 'user123', name: 'Test User' };
    
    req.headers.authorization = 'Bearer valid-token';
    
    jwt.verify.mockImplementation((token, getKey, options, callback) => {
      callback(null, mockDecoded);
    });

    await jwtCheck(req, res, next);

    expect(req.user).toEqual(mockDecoded);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('debería devolver 401 si no se proporciona el header Authorization', async () => {
    await jwtCheck(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería devolver 401 si el header no comienza con Bearer', async () => {
    req.headers.authorization = 'Invalid valid-token';

    await jwtCheck(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería devolver 401 si el token es inválido', async () => {
    const jwt = require('jsonwebtoken');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    req.headers.authorization = 'Bearer invalid-token';
    
    jwt.verify.mockImplementation((token, getKey, options, callback) => {
      callback(new Error('Invalid token'), null);
    });

    await jwtCheck(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
});

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

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  it('debería llamar a next() si el usuario tiene el rol de administrador', async () => {
    const axios = require('axios');
    axios.post.mockResolvedValue({ data: { access_token: 'managementToken' } });
    axios.get.mockResolvedValue({ data: [{ name: 'admin' }] });

    await checkAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('debería devolver 403 si el usuario no tiene el rol de administrador', async () => {
    const axios = require('axios');
    axios.post.mockResolvedValue({ data: { access_token: 'managementToken' } });
    axios.get.mockResolvedValue({ data: [{ name: 'user' }] });

    await checkAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('debería devolver 500 si axios.post falla', async () => {
    const axios = require('axios');
    axios.post.mockRejectedValue(new Error('falló'));

    await checkAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });

  it('debería devolver 500 si axios.get falla', async () => {
    const axios = require('axios');
    axios.post.mockResolvedValue({ data: { access_token: 'managementToken' } });
    axios.get.mockRejectedValue(new Error('falló roles'));

    await checkAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error interno del servidor',
    });
  });

  it('debería devolver 403 si roles está vacío', async () => {
    const axios = require('axios');
    axios.post.mockResolvedValue({ data: { access_token: 'managementToken' } });
    axios.get.mockResolvedValue({ data: [] });

    await checkAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('debería llamar a next() si "admin" está entre varios roles', async () => {
    const axios = require('axios');
    axios.post.mockResolvedValue({ data: { access_token: 'managementToken' } });
    axios.get.mockResolvedValue({ data: [{ name: 'user' }, { name: 'admin' }] });

    await checkAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('debería devolver 500 si req.user no existe', async () => {
    req.user = null;
    const axios = require('axios');
    axios.post.mockResolvedValue({ data: { access_token: 'managementToken' } });
    axios.get.mockResolvedValue({ data: [{ name: 'admin' }] });

    await checkAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('debería devolver 500 si req.user.sub no existe', async () => {
    req.user = {};
    const axios = require('axios');
    axios.post.mockResolvedValue({ data: { access_token: 'managementToken' } });
    // Mock axios.get to fail when user_id is undefined
    axios.get.mockRejectedValue(new Error('Invalid user ID'));

    await checkAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
  });
});
