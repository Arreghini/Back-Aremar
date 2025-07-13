const httpMocks = require('node-mocks-http');
const updateUserHandler = require('../updateUserHandler');
const updateUserController = require('../../../controllers/user/updateProfileController');

jest.mock('../../../controllers/user/updateProfileController');

describe('updateUserHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update user profile', async () => {
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
    const mockUserId = '123';
    const mockUpdateData = { name: 'John Doe' };
    const req = httpMocks.createRequest({
      method: 'PUT',
      url: `/users/${mockUserId}`,
      params: { id: mockUserId },
      body: mockUpdateData
    });
    const res = httpMocks.createResponse();

    const error = new Error('Update failed');
    updateUserController.mockRejectedValue(error);

    await updateUserHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Update failed' });
  });

  it('should handle invalid update data format', async () => {
    const mockUserId = '123';
    const invalidData = 'not an object';
    const req = httpMocks.createRequest({
      method: 'PUT',
      url: `/users/${mockUserId}`,
      params: { id: mockUserId },
      body: invalidData
    });
    const res = httpMocks.createResponse();

    await updateUserHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'Invalid update data format' });
  });
});
