const cloudinary = require('../../utils/cloudinary');

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn()
    }
  }
}));

describe('cloudinary configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should export cloudinary instance', () => {
    expect(cloudinary).toBeDefined();
    expect(typeof cloudinary).toBe('object');
  });

  test('should have required cloudinary methods', () => {
    expect(cloudinary.v2.config).toBeDefined();
    expect(cloudinary.v2.uploader.upload).toBeDefined();
    expect(cloudinary.v2.uploader.destroy).toBeDefined();
  });

  test('should handle upload method calls', async () => {
    const mockResult = {
      public_id: 'test123',
      secure_url: 'https://test.cloudinary.com/image.jpg'
    };
    
    cloudinary.v2.uploader.upload.mockResolvedValue(mockResult);
    
    const result = await cloudinary.v2.uploader.upload('test-file');
    
    expect(result).toEqual(mockResult);
    expect(cloudinary.v2.uploader.upload).toHaveBeenCalledWith('test-file');
  });

  test('should handle destroy method calls', async () => {
    const mockResult = { result: 'ok' };
    
    cloudinary.v2.uploader.destroy.mockResolvedValue(mockResult);
    
    const result = await cloudinary.v2.uploader.destroy('test123');
    
    expect(result).toEqual(mockResult);
    expect(cloudinary.v2.uploader.destroy).toHaveBeenCalledWith('test123');
  });

  test('should handle upload errors', async () => {
    const mockError = new Error('Upload failed');
    
    cloudinary.v2.uploader.upload.mockRejectedValue(mockError);
    
    await expect(cloudinary.v2.uploader.upload('test-file'))
      .rejects.toThrow('Upload failed');
  });

  test('should handle destroy errors', async () => {
    const mockError = new Error('Destroy failed');
    
    cloudinary.v2.uploader.destroy.mockRejectedValue(mockError);
    
    await expect(cloudinary.v2.uploader.destroy('test123'))
      .rejects.toThrow('Destroy failed');
  });
});
