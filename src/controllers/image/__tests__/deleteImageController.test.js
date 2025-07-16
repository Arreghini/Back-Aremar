const cloudinary = require('../../../utils/cloudinary'); // Importa el mismo cloudinary que usa el controlador
const deleteImageController = require('../deleteImageController');
const httpMocks = require('node-mocks-http');

jest.mock('../../../utils/cloudinary'); // Mockea todo el módulo cloudinary

describe('deleteImageController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Define la función destroy como mock para cada test
    cloudinary.uploader.destroy = jest.fn();
  });

  test('should successfully delete an image from cloudinary', async () => {
    const publicId = 'test-image-id';

    cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

    const req = httpMocks.createRequest({
      method: 'DELETE',
      params: { publicId },
    });
    const res = httpMocks.createResponse();

    await deleteImageController(req, res);

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(publicId);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ message: 'Image deleted successfully' });
  });

  test('should handle missing publicId parameter', async () => {
    const req = httpMocks.createRequest({
      method: 'DELETE',
      params: {},
    });
    const res = httpMocks.createResponse();

    await deleteImageController(req, res);

    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Public ID is required' });
  });

  test('should handle cloudinary deletion error', async () => {
    const publicId = 'test-image-id';

    cloudinary.uploader.destroy.mockRejectedValue(new Error('Cloudinary error'));

    const req = httpMocks.createRequest({
      method: 'DELETE',
      params: { publicId },
    });
    const res = httpMocks.createResponse();

    await deleteImageController(req, res);

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(publicId);
    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Error deleting image' });
  });

  test('should handle cloudinary not found response', async () => {
    const publicId = 'non-existent-image';

    cloudinary.uploader.destroy.mockResolvedValue({ result: 'not found' });

    const req = httpMocks.createRequest({
      method: 'DELETE',
      params: { publicId },
    });
    const res = httpMocks.createResponse();

    await deleteImageController(req, res);

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(publicId);
    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData()).toEqual({ error: 'Image not found' });
  });
});
