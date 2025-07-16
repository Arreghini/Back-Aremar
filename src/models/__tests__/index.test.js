const path = require('path');

describe('basename', () => {
  test('should return correct basename for __filename', () => {
    const mockFilename = '/path/to/file/index.js';
    const result = path.basename(mockFilename);
    expect(result).toBe('index.js');
  });

  test('should handle file path with no directory', () => {
    const mockFilename = 'index.js';
    const result = path.basename(mockFilename);
    expect(result).toBe('index.js');
  });

  test('should handle file path with multiple extensions', () => {
    const mockFilename = '/path/to/file/index.test.js';
    const result = path.basename(mockFilename);
    expect(result).toBe('index.test.js');
  });

  test('should handle file path with dots in directory names', () => {
    const mockFilename = '/path.to/file.name/index.js';
    const result = path.basename(mockFilename);
    expect(result).toBe('index.js');
  });

  test('should handle Windows-style paths', () => {
    const mockFilename = 'C:\\path\\to\\file\\index.js';
    const result = path.basename(mockFilename);
    expect(result).toBe('index.js');
  });
});
