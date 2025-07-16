// 👇 Mock del módulo fs/promises
jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(),
  mkdir: jest.fn().mockResolvedValue()
}));

const { uploadImageController } = require('../uploadImageController');

const validMockFile = {
  originalname: 'imagen.jpg',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('mock image data'),
  path: '/uploads/imagen.jpg'
};

// Para no ver logs durante el test
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('uploadImageController', () => {
  test('should successfully upload an image', async () => {
    const result = await uploadImageController(validMockFile);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('fileName');
  });

  test('should handle upload failure', async () => {
    const fileWithError = {
      ...validMockFile,
      buffer: null,
    };

    await expect(uploadImageController(fileWithError))
      .rejects
      .toThrow('Archivo no válido o buffer faltante');
  });

  test('should handle invalid file input', async () => {
    await expect(uploadImageController(null))
      .rejects
      .toThrow('Archivo no válido o buffer faltante');
  });

  test('should handle empty file path', async () => {
    const mockFile = {
      ...validMockFile,
      path: '',
    };

    await expect(uploadImageController(mockFile))
      .rejects
      .toThrow('Invalid file path');
  });

  test('should handle unsupported file types', async () => {
    const mockFile = {
      ...validMockFile,
      mimetype: 'application/pdf',
    };

    await expect(uploadImageController(mockFile))
      .rejects
      .toThrow('Unsupported file type');
  });
});
