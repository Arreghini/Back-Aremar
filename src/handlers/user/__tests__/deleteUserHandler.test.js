const httpMocks = require('node-mocks-http');
const deleteUserHandler = require('../../../handlers/user/deleteUserHandler');
const deleteUserController = require('../../../controllers/user/deleteUserController');

jest.mock('../../../controllers/user/deleteUserController');

describe('deleteUserHandler', () => {
  it('should properly pass through to deleteUserController', async () => {
    const mockUserId = '123';
    const req = httpMocks.createRequest({
      method: 'DELETE',
      url: `/users/${mockUserId}`,
      params: { id: mockUserId },
    });
    const res = httpMocks.createResponse();

    deleteUserController.mockResolvedValue({ message: 'User deleted' });

    await deleteUserHandler(req, res);

    expect(deleteUserController).toHaveBeenCalledWith(mockUserId);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ message: 'User deleted successfully' });
  });

  it('should propagate errors from deleteUserController', async () => {
    const mockUserId = '123';
    const req = httpMocks.createRequest({
      method: 'DELETE',
      url: `/users/${mockUserId}`,
      params: { id: mockUserId },
    });
    const res = httpMocks.createResponse();

    deleteUserController.mockRejectedValue(new Error('Test error'));

    await deleteUserHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Test error' });
  });

  it('should handle undefined user ID', async () => {
    const req = httpMocks.createRequest({
      method: 'DELETE',
      url: `/users/`,
      params: {}, // no ID
    });
    const res = httpMocks.createResponse();

    await deleteUserHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'User ID is required' });
  });
});
