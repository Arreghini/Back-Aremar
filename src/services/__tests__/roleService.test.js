const path = require('path');

describe('roleService', () => {
  let roleService;
  let dotenvMock;
  let axiosMock;

  beforeAll(() => {
    // Mock de dotenv antes de cualquier importación
    dotenvMock = {
      config: jest.fn()
    };
    jest.doMock('dotenv', () => dotenvMock);

    // Mock de axios
    axiosMock = {
      post: jest.fn(),
      get: jest.fn(),
    };
    jest.doMock('axios', () => axiosMock);
  });

  beforeEach(() => {
    // Limpiar módulos y mocks
    jest.resetModules();
    jest.clearAllMocks();
    
    // Limpiar variables de entorno
    const envVarsToDelete = [
      'EXISTING_VAR', 'SYSTEM_VAR', 'SPECIAL_VAR', 'NUMERIC_VAR', 'UNDEFINED_VAR',
      'BOOL_VAR', 'WHITESPACE_VAR', 'NULL_VAR', 'URL_VAR', 'JSON_VAR', 'PATH_VAR',
      'MULTILINE_VAR', 'UNICODE_VAR', 'LONG_VAR', 'ESCAPED_VAR', 'BASE64_VAR',
      'QUERY_VAR', 'CONN_STRING', 'AUTH0_DOMAIN', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET',
      'NEW_VAR'
    ];
    
    envVarsToDelete.forEach(varName => {
      delete process.env[varName];
    });

    // Resetear mocks
    dotenvMock.config.mockReset();
    axiosMock.post.mockReset();
    axiosMock.get.mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('loadEnv functionality', () => {
    it('should call dotenv.config() when importing roleService', () => {
      dotenvMock.config.mockReturnValue({ parsed: {} });
      
      roleService = require('../roleService');
      
      expect(dotenvMock.config).toHaveBeenCalled();
    });

    it('should not throw error if .env file is missing', () => {
      dotenvMock.config.mockReturnValue({ error: new Error('Missing .env') });
      
      expect(() => {
        roleService = require('../roleService');
      }).not.toThrow();
    });

    it('should preserve existing environment variables', () => {
      process.env.EXISTING_VAR = 'exists';
      dotenvMock.config.mockReturnValue({ parsed: { EXISTING_VAR: 'new_value' } });
      
      roleService = require('../roleService');
      roleService.loadEnv();
      
      expect(process.env.EXISTING_VAR).toBe('exists');
    });

    it('should set environment variables from .env if not existing', () => {
      dotenvMock.config.mockReturnValue({ parsed: { NEW_VAR: 'value_from_env' } });
      
      roleService = require('../roleService');
      roleService.loadEnv();
      
      expect(process.env.NEW_VAR).toBe('value_from_env');
    });

    it('should not override system environment variables with empty values', () => {
      process.env.SYSTEM_VAR = 'system';
      dotenvMock.config.mockReturnValue({ parsed: { SYSTEM_VAR: '' } });
      
      roleService = require('../roleService');
      roleService.loadEnv();
      
      expect(process.env.SYSTEM_VAR).toBe('system');
    });

    it('should handle when dotenv.config returns undefined', () => {
      dotenvMock.config.mockReturnValue(undefined);
      
      expect(() => {
        roleService = require('../roleService');
        roleService.loadEnv();
      }).not.toThrow();
    });

    it('should handle when dotenv.config returns null', () => {
      dotenvMock.config.mockReturnValue(null);
      
      expect(() => {
        roleService = require('../roleService');
        roleService.loadEnv();
      }).not.toThrow();
    });

    it('should handle when parsed is undefined', () => {
      dotenvMock.config.mockReturnValue({ parsed: undefined });
      
      expect(() => {
        roleService = require('../roleService');
        roleService.loadEnv();
      }).not.toThrow();
    });

    it('should handle when parsed is null', () => {
      dotenvMock.config.mockReturnValue({ parsed: null });
      
      expect(() => {
        roleService = require('../roleService');
        roleService.loadEnv();
      }).not.toThrow();
    });

    it('should handle empty parsed object', () => {
      dotenvMock.config.mockReturnValue({ parsed: {} });
      
      expect(() => {
        roleService = require('../roleService');
        roleService.loadEnv();
      }).not.toThrow();
    });

    it('should not set empty string values from .env', () => {
      dotenvMock.config.mockReturnValue({ parsed: { EMPTY_VAR: '' } });
      
      roleService = require('../roleService');
      roleService.loadEnv();
      
      expect(process.env.EMPTY_VAR).toBeUndefined();
    });

    it('should set non-empty values from .env', () => {
      dotenvMock.config.mockReturnValue({ 
        parsed: { 
          NON_EMPTY_VAR: 'some_value',
          ANOTHER_VAR: 'another_value'
        } 
      });
      
      roleService = require('../roleService');
      roleService.loadEnv();
      
      expect(process.env.NON_EMPTY_VAR).toBe('some_value');
      expect(process.env.ANOTHER_VAR).toBe('another_value');
    });
  });

  describe('getManagementApiToken', () => {
    beforeEach(() => {
      process.env.AUTH0_DOMAIN = 'test-domain.auth0.com';
      process.env.AUTH0_CLIENT_ID = 'test-client-id';
      process.env.AUTH0_CLIENT_SECRET = 'test-client-secret';
      
      dotenvMock.config.mockReturnValue({ parsed: {} });
      roleService = require('../roleService');
    });

    it('should successfully get management API token', async () => {
      const mockToken = 'mock-access-token';
      axiosMock.post.mockResolvedValue({
        data: { access_token: mockToken }
      });

      const token = await roleService.getManagementApiToken();

      expect(axiosMock.post).toHaveBeenCalledWith(
        'https://test-domain.auth0.com/oauth/token',
        {
          client_id: 'test-client-id',
          client_secret: 'test-client-secret',
          audience: 'https://test-domain.auth0.com/api/v2/',
          grant_type: 'client_credentials',
        }
      );
      expect(token).toBe(mockToken);
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('API Error');
      axiosMock.post.mockRejectedValue(mockError);

      await expect(roleService.getManagementApiToken()).rejects.toThrow(
        'Error al obtener el token del Management API'
      );
    });

    it('should handle network timeout error', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.code = 'ECONNABORTED';
      axiosMock.post.mockRejectedValue(timeoutError);

      await expect(roleService.getManagementApiToken()).rejects.toThrow(
        'Error al obtener el token del Management API'
      );
    });

    it('should handle 401 unauthorized error', async () => {
      const unauthorizedError = new Error('Unauthorized');
      unauthorizedError.response = { status: 401 };
      axiosMock.post.mockRejectedValue(unauthorizedError);

      await expect(roleService.getManagementApiToken()).rejects.toThrow(
        'Error al obtener el token del Management API'
      );
    });

    it('should handle missing environment variables', async () => {
      delete process.env.AUTH0_DOMAIN;
      delete process.env.AUTH0_CLIENT_ID;
      delete process.env.AUTH0_CLIENT_SECRET;

      // Re-require el módulo para que tome las nuevas variables de entorno
      jest.resetModules();
      roleService = require('../roleService');

      axiosMock.post.mockResolvedValue({
        data: { access_token: 'token' }
      });

      await roleService.getManagementApiToken();

      expect(axiosMock.post).toHaveBeenCalledWith(
        'https://undefined/oauth/token',
        expect.objectContaining({
          client_id: undefined,
          client_secret: undefined
        })
      );
    });
  });

  describe('checkUserRole', () => {
    beforeEach(() => {
      process.env.AUTH0_DOMAIN = 'test-domain.auth0.com';
      
      dotenvMock.config.mockReturnValue({ parsed: {} });
      roleService = require('../roleService');
    });

    it('should return true when user has admin role', async () => {
      const mockRoles = [
        { name: 'admin' },
        { name: 'user' }
      ];
      axiosMock.get.mockResolvedValue({ data: mockRoles });

      const result = await roleService.checkUserRole('user123', 'mock-token');

      expect(axiosMock.get).toHaveBeenCalledWith(
        'https://test-domain.auth0.com/api/v2/users/user123/roles',
        {
          headers: {
            Authorization: 'Bearer mock-token',
          },
        }
      );
      expect(result).toBe(true);
    });

    it('should return false when user does not have admin role', async () => {
      const mockRoles = [
        { name: 'user' },
        { name: 'guest' }
      ];
      axiosMock.get.mockResolvedValue({ data: mockRoles });

      const result = await roleService.checkUserRole('user123', 'mock-token');

      expect(result).toBe(false);
    });

    it('should return false when user has no roles', async () => {
      axiosMock.get.mockResolvedValue({ data: [] });

      const result = await roleService.checkUserRole('user123', 'mock-token');

      expect(result).toBe(false);
    });

    it('should return true when user has admin role among multiple roles', async () => {
      const mockRoles = [
        { name: 'user' },
        { name: 'moderator' },
        { name: 'admin' },
        { name: 'guest' }
      ];
      axiosMock.get.mockResolvedValue({ data: mockRoles });

      const result = await roleService.checkUserRole('admin-user', 'mock-token');

      expect(result).toBe(true);
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('API Error');
      axiosMock.get.mockRejectedValue(mockError);

      await expect(roleService.checkUserRole('user123', 'mock-token')).rejects.toThrow(
        'Error al obtener los roles del usuario'
      );
    });

    it('should handle unauthorized error', async () => {
      const unauthorizedError = new Error('Unauthorized');
      unauthorizedError.response = { status: 401 };
      axiosMock.get.mockRejectedValue(unauthorizedError);

      await expect(roleService.checkUserRole('user123', 'invalid-token')).rejects.toThrow(
        'Error al obtener los roles del usuario'
      );
    });

    it('should handle user not found error', async () => {
      const notFoundError = new Error('User not found');
      notFoundError.response = { status: 404 };
      axiosMock.get.mockRejectedValue(notFoundError);

      await expect(roleService.checkUserRole('nonexistent-user', 'mock-token')).rejects.toThrow(
        'Error al obtener los roles del usuario'
      );
    });

    it('should return false when response data is null', async () => {
  axiosMock.get.mockResolvedValue({ data: null });

  const result = await roleService.checkUserRole('user123', 'mock-token');
  expect(result).toBe(false);
});

    it('should handle response with roles without name property', async () => {
      const mockRoles = [
        { id: 1 },
        { id: 2, name: 'admin' }
      ];
      axiosMock.get.mockResolvedValue({ data: mockRoles });

      const result = await roleService.checkUserRole('user123', 'mock-token');

      expect(result).toBe(true);
    });
  });

  describe('Environment variable handling edge cases', () => {
    beforeEach(() => {
      dotenvMock.config.mockReturnValue({ parsed: {} });
      roleService = require('../roleService');
    });

    it('should handle special characters in environment variables', () => {
      process.env.SPECIAL_VAR = '@!$%&*()';
      roleService.loadEnv();
      expect(process.env.SPECIAL_VAR).toBe('@!$%&*()');
    });

    it('should handle numeric values in environment variables', () => {
      process.env.NUMERIC_VAR = '12345';
      roleService.loadEnv();
      expect(process.env.NUMERIC_VAR).toBe('12345');
    });

    it('should handle undefined environment variables gracefully', () => {
      process.env.UNDEFINED_VAR = 'undefined';
      roleService.loadEnv();
      expect(process.env.UNDEFINED_VAR).toBe('undefined');
    });

    it('should handle null values in environment variables', () => {
      process.env.NULL_VAR = 'null';
      roleService.loadEnv();
      expect(process.env.NULL_VAR).toBe('null');
    });

    it('should handle environment variables with URL values', () => {
      process.env.URL_VAR = 'https://example.com';
      roleService.loadEnv();
      expect(process.env.URL_VAR).toBe('https://example.com');
    });

    it('should handle environment variables with JSON strings', () => {
      process.env.JSON_VAR = '{"key": "value"}';
      roleService.loadEnv();
      expect(process.env.JSON_VAR).toBe('{"key": "value"}');
    });

        it('should handle environment variables with path-like values', () => {
      process.env.PATH_VAR = 'C:\\Program Files\\App\\bin';
      roleService.loadEnv();
      expect(process.env.PATH_VAR).toBe('C:\\Program Files\\App\\bin');
    });
  });
}); 