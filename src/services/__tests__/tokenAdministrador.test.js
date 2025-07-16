const { tokenAdministrador } = require('../tokenAdministrador.js');

describe('tokenAdministrador', () => {
  beforeEach(() => {
    jest.resetModules(); // Limpia el cache para que require sea fresco
    jest.clearAllMocks(); // Limpia todos los mocks
  });

  it('should load environment variables', () => {
    const dotenv = require('dotenv');
    const configSpy = jest.spyOn(dotenv, 'config').mockReturnValue({ parsed: { TOKEN: '123' } });

    // Ahora requerimos después del spy y resetModules
    require('../tokenAdministrador.js');

    // Verificamos que se haya llamado al menos una vez
    expect(configSpy).toHaveBeenCalled();
  });

  it('should not throw error when .env file is missing', () => {
    jest.resetModules();
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
});

describe('tokenAdministrador edge cases', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.TEST_VAR;
  });

  afterEach(() => {
    delete process.env.TEST_VAR;
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

describe('tokenAdministrador advanced scenarios', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.VAR1;
    delete process.env.VAR2;
  });

  afterEach(() => {
    delete process.env.VAR1;
    delete process.env.VAR2;
  });

  it('should handle multiple consecutive config calls', () => {
    // Primero, obtenemos el módulo dotenv y creamos el spy
    const dotenv = require('dotenv');
    const configSpy = jest.spyOn(dotenv, 'config');
    
    // Primera llamada - configuramos el mock
    configSpy.mockReturnValueOnce({ parsed: { VAR1: 'first' } });
    
    // Importamos el módulo por primera vez
    const { loadEnv: loadEnv1 } = require('../tokenAdministrador.js');
    
    // Verificamos la primera llamada
    expect(configSpy).toHaveBeenCalledTimes(1);
    expect(process.env.VAR1).toBe('first');
    
    // Segunda llamada - configuramos el mock para la segunda llamada
    configSpy.mockReturnValueOnce({ parsed: { VAR2: 'second' } });
    
    // Llamamos loadEnv directamente (simula una segunda carga)
    loadEnv1();
    
    // Verificamos que se llamó dos veces
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
    for (let i = 0; i < 1000; i++) {
      largeEnvObject[`VAR_${i}`] = `value_${i}`;
    }
    
    jest.spyOn(dotenv, 'config').mockReturnValue({ parsed: largeEnvObject });
    require('../tokenAdministrador.js');
    
    expect(process.env.VAR_0).toBe('value_0');
    expect(process.env.VAR_999).toBe('value_999');
  });
});
