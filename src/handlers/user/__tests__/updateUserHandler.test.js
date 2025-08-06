const httpMocks = require('node-mocks-http');
const updateUserHandler = require('../updateUserHandler');
const updateUserController = require('../../../controllers/user/updateUserController');

jest.mock('../../../controllers/user/updateUserController'); // ✅ Este es el correcto

describe('updateUserHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update user profile', async () => {
    jest.setTimeout(10000);
    const mockUserId = '123';
    const mockUpdateData = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    const req = httpMocks.createRequest({
      method: 'PUT',
      url: `/users/${mockUserId}`,
      params: { id: mockUserId },
      body: mockUpdateData
    });
    const res = httpMocks.createResponse();

    updateUserController.mockResolvedValue({
      id: mockUserId,
      ...mockUpdateData
    });

    await updateUserHandler(req, res);

    expect(updateUserController).toHaveBeenCalledWith(mockUserId, mockUpdateData);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      message: 'User updated successfully',
      user: {
        id: mockUserId,
        ...mockUpdateData
      }
    });
  });

  it('should handle missing user ID', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      url: '/users',
      params: {},
      body: { name: 'John Doe' }
    });
    const res = httpMocks.createResponse();

    await updateUserHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'User ID is required' });
  });

  it('should handle empty request body', async () => {
    const mockUserId = '123';
    const req = httpMocks.createRequest({
      method: 'PUT',
      url: `/users/${mockUserId}`,
      params: { id: mockUserId },
      body: {}
    });
    const res = httpMocks.createResponse();

    await updateUserHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'Update data is required' });
  });

  it('should handle controller errors', async () => {
    jest.setTimeout(10000);
    const mockUserId = '123';
    const mockUpdateData = { name: 'John Doe' };

    const req = httpMocks.createRequest({
      method: 'PUT',
      url: `/users/${mockUserId}`,
      params: { id: mockUserId },
      body: mockUpdateData
    });
    const res = httpMocks.createResponse();

    updateUserController.mockRejectedValue(new Error('Update failed'));

    await updateUserHandler(req, res);

    await new Promise(setImmediate); // Asegura que se complete el ciclo de evento

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Update failed' });
  });
});
