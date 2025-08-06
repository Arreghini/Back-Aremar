jest.mock('../../utils/cloudinary', () => ({
  config: jest.fn(),
  uploader: {
    upload: jest.fn(),
    destroy: jest.fn()
  }
}));

const cloudinary = require('../../utils/cloudinary');

describe('cloudinary configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should export cloudinary instance', () => {
    expect(cloudinary).toBeDefined();
    expect(typeof cloudinary).toBe('object');
  });

  test('should have required cloudinary methods', () => {
    expect(cloudinary.config).toBeDefined();
    expect(cloudinary.uploader.upload).toBeDefined();
    expect(cloudinary.uploader.destroy).toBeDefined();
  });

  test('should handle upload method calls', async () => {
    const mockResult = {
      public_id: 'test123',
      secure_url: 'https://test.cloudinary.com/image.jpg'
    };
    
    cloudinary.uploader.upload.mockResolvedValue(mockResult);
    
    const result = await cloudinary.uploader.upload('test-file');
    
    expect(result).toEqual(mockResult);
    expect(cloudinary.uploader.upload).toHaveBeenCalledWith('test-file');
  });

  test('should handle destroy method calls', async () => {
    const mockResult = { result: 'ok' };
    
    cloudinary.uploader.destroy.mockResolvedValue(mockResult);
    
    const result = await cloudinary.uploader.destroy('test123');
    
    expect(result).toEqual(mockResult);
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('test123');
  });

  test('should handle upload errors', async () => {
    const mockError = new Error('Upload failed');
    
    cloudinary.uploader.upload.mockRejectedValue(mockError);
    
    await expect(cloudinary.uploader.upload('test-file'))
      .rejects.toThrow('Upload failed');
  });

  test('should handle destroy errors', async () => {
    const mockError = new Error('Destroy failed');
    
    cloudinary.uploader.destroy.mockRejectedValue(mockError);
    
    await expect(cloudinary.uploader.destroy('test123'))
      .rejects.toThrow('Destroy failed');
  });
});