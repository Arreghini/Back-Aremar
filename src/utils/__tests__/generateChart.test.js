// chartUtils.test.js
const { generateChart } = require('../generateChart');
const { exec } = require('child_process');

jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

describe('generateChart', () => {
  const startDate = '2025-01-01';
  const endDate = '2025-01-31';
  const authToken = 'fake-token';

  const mockSvgPath = expect.stringContaining('temp_chart.svg');
  const mockPngPath = expect.stringContaining('temp_chart.png');

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe resolver con rutas de SVG y PNG si el script se ejecuta correctamente', async () => {
    exec.mockImplementation((cmd, callback) => {
      callback(null, 'SUCCESS: svg generado\nSUCCESS_PNG: png generado', '');
    });

    const result = await generateChart(startDate, endDate, authToken);

    expect(result).toEqual({
      svgPath: mockSvgPath,
      pngPath: mockPngPath,
    });
    expect(exec).toHaveBeenCalledTimes(1);
    expect(exec.mock.calls[0][0]).toContain('python');
  });

  it('debe rechazar si ocurre un error en la ejecución del script', async () => {
    exec.mockImplementation((cmd, callback) => {
      callback(new Error('Error en script'), '', '');
    });

    await expect(generateChart(startDate, endDate, authToken)).rejects.toThrow('Error en script');
  });

  it('debe rechazar si el script no genera correctamente el PNG', async () => {
    exec.mockImplementation((cmd, callback) => {
      callback(null, 'SUCCESS: svg generado', ''); // Falta SUCCESS_PNG
    });

    await expect(generateChart(startDate, endDate, authToken))
      .rejects
      .toThrow('Script Python no generó el archivo PNG correctamente');
  });
});
