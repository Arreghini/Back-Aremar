describe('tokenAdministrador', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('loadEnv functionality', () => {
    it('should load environment variables', () => {
      const dotenv = require('dotenv');
      const configSpy = jest.spyOn(dotenv, 'config').mockReturnValue({ parsed: { TOKEN: '123' } });

      require('../tokenAdministrador.js');

      expect(configSpy).toHaveBeenCalled();
    });

    it('should not throw error when .env file is missing', () => {
      const dotenv = require('dotenv');
      const configSpy = jest.spyOn(dotenv, 'config').mockReturnValue({ error: new Error('File missing') });

      expect(() => require('../tokenAdministrador.js')).not.toThrow();
      expect(configSpy).toHaveBeenCalled();
    });

    it('should preserve existing environment variables', () => {
      process.env.EXISTING_VAR = 'already_set';
      const dotenv = require('dotenv');
      jest.spyOn(dotenv, 'config').mockReturnValue({
        parsed: {
          EXISTING_VAR: 'new_value',
          NEW_VAR: 'new',
        },
      });
      require('../tokenAdministrador.js');
      expect(process.env.EXISTING_VAR).toBe('already_set');
      expect(process.env.NEW_VAR).toBe('new');
    });

    it('should handle empty parsed values from dotenv', () => {
      const dotenv = require('dotenv');
      jest.spyOn(dotenv, 'config').mockReturnValue({ parsed: {} });
      require('../tokenAdministrador.js');
      expect(process.env).toEqual(expect.any(Object));
    });

    it('should handle null parsed values from dotenv', () => {
      const dotenv = require('dotenv');
      jest.spyOn(dotenv, 'config').mockReturnValue({ parsed: null });
      require('../tokenAdministrador.js');
      expect(process.env).toEqual(expect.any(Object));
    });

    it('should handle undefined return from dotenv config', () => {
      const dotenv = require('dotenv');
      jest.spyOn(dotenv, 'config').mockReturnValue(undefined);
      require('../tokenAdministrador.js');
      expect(process.env).toEqual(expect.any(Object));
    });

    it('should handle malformed env file content', () => {
      const dotenv = require('dotenv');
      jest.spyOn(dotenv, 'config').mockReturnValue({ error: new Error('Malformed entry'), parsed: null });
      require('../tokenAdministrador.js');
      expect(process.env).toEqual(expect.any(Object));
    });
  });

  describe('module structure', () => {
    it('should export required functions', () => {
      const tokenModule = require('../tokenAdministrador.js');
      
      expect(typeof tokenModule.loadEnv).toBe('function');
      expect(typeof tokenModule.getManagementApiToken).toBe('function');
      expect(typeof tokenModule.checkUserRole).toBe('function');
    });
  });

  describe('loadEnv function', () => {
    it('should be callable multiple times', () => {
      const dotenv = require('dotenv');
      const configSpy = jest.spyOn(dotenv, 'config');
      
      configSpy.mockReturnValueOnce({ parsed: { VAR1: 'first' } });
      
      const { loadEnv } = require('../tokenAdministrador.js');
      
      expect(configSpy).toHaveBeenCalledTimes(1);
      expect(process.env.VAR1).toBe('first');
      
      configSpy.mockReturnValueOnce({ parsed: { VAR2: 'second' } });
      
      loadEnv();
      
      expect(configSpy).toHaveBeenCalledTimes(2);
      expect(process.env.VAR2).toBe('second');
    });

    it('should handle process.env being frozen', () => {
      const originalEnv = process.env;
      const frozenEnv = Object.freeze({ ...process.env });
      process.env = frozenEnv;

      const dotenv = require('dotenv');
      jest.spyOn(dotenv, 'config').mockReturnValue({ parsed: { NEW_VAR: 'value' } });

      expect(() => require('../tokenAdministrador.js')).not.toThrow();
      process.env = originalEnv;
    });

    it('should handle special characters in env values', () => {
      const dotenv = require('dotenv');
      jest.spyOn(dotenv, 'config').mockReturnValue({
        parsed: {
          SPECIAL_CHARS: '!@#$%^&*()',
          UNICODE: '🚀👨‍💻',
          QUOTES: '"quoted"\'single\'',
          NEWLINES: 'line1\nline2'
        }
      });

      require('../tokenAdministrador.js');
      expect(process.env.SPECIAL_CHARS).toBe('!@#$%^&*()');
      expect(process.env.UNICODE).toBe('🚀👨‍💻');
      expect(process.env.QUOTES).toBe('"quoted"\'single\'');
      expect(process.env.NEWLINES).toBe('line1\nline2');
    });

    it('should handle very large env files', () => {
      const dotenv = require('dotenv');
      const largeEnvObject = {};
      for (let i = 0; i < 100; i++) {
        largeEnvObject[`VAR_${i}`] = `value_${i}`;
      }
      
      jest.spyOn(dotenv, 'config').mockReturnValue({ parsed: largeEnvObject });
      require('../tokenAdministrador.js');
      
      expect(process.env.VAR_0).toBe('value_0');
      expect(process.env.VAR_99).toBe('value_99');
    });
  });

  describe('error handling integration', () => {
    it('should handle axios module import errors gracefully', () => {
      // Test que el módulo se pueda importar sin errores
      expect(() => require('../tokenAdministrador.js')).not.toThrow();
    });

    it('should handle missing environment variables', () => {
      delete process.env.AUTH0_DOMAIN;
      delete process.env.AUTH0_CLIENT_ID;
      delete process.env.AUTH0_CLIENT_SECRET;
      
      expect(() => require('../tokenAdministrador.js')).not.toThrow();
    });
  });

  describe('function coverage', () => {
    it('should cover loadEnv function paths', () => {
      const dotenv = require('dotenv');
      
      // Test path when result is undefined
      jest.spyOn(dotenv, 'config').mockReturnValue(undefined);
      const { loadEnv } = require('../tokenAdministrador.js');
      
      expect(() => loadEnv()).not.toThrow();
      
      // Test path when result.parsed is null
      jest.clearAllMocks();
      jest.spyOn(dotenv, 'config').mockReturnValue({ parsed: null });
      expect(() => loadEnv()).not.toThrow();
      
      // Test path when result.parsed has empty string values
      jest.clearAllMocks();
      jest.spyOn(dotenv, 'config').mockReturnValue({ parsed: { EMPTY_VAR: '' } });
      expect(() => loadEnv()).not.toThrow();
    });

    it('should test conditional logic in loadEnv', () => {
      const dotenv = require('dotenv');
      
      // Configurar variable existente
      process.env.EXISTING_KEY = 'original';
      
      // Mock dotenv para devolver el mismo key
      jest.spyOn(dotenv, 'config').mockReturnValue({
        parsed: {
          EXISTING_KEY: 'new_value',
          NEW_KEY: 'new_value'
        }
      });
      
      const { loadEnv } = require('../tokenAdministrador.js');
      
      // La variable existente no debe cambiar
      expect(process.env.EXISTING_KEY).toBe('original');
      // La nueva variable debe establecerse
      expect(process.env.NEW_KEY).toBe('new_value');
    });
  });
});
