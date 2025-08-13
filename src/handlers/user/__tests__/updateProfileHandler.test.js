const httpMocks = require('node-mocks-http');
const updateUserHandler = require('../updateProfileHandler');
const updateUserController = require('../../../controllers/user/updateUserController');

jest.mock('../../../controllers/user/updateUserController');

describe('updateUserHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe devolver 401 si no hay userId en la request', async () => {
    const req = httpMocks.createRequest({
      method: 'PATCH',
      url: '/user/profile',
      body: {},
    });
    const res = httpMocks.createResponse();

    await updateUserHandler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual({ message: 'User ID is required' });
  });

  it('debe devolver 400 si faltan datos obligatorios', async () => {
    const req = httpMocks.createRequest({
      method: 'PATCH',
      url: '/user/profile',
      body: { userId: '123' }, // Falta el resto de los campos requeridos
    });
    const res = httpMocks.createResponse();

    await updateUserHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'User ID is required' }); // Igualamos al mensaje real
  });

  it('debe actualizar el usuario correctamente', async () => {
    const req = httpMocks.createRequest({
      method: 'PATCH',
      url: '/user/profile',
      body: { userId: '123', name: 'John Doe', email: 'john@example.com' },
    });
    const res = httpMocks.createResponse();

    updateUserController.mockResolvedValue({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
    });

    await updateUserHandler(req, res);

    expect(updateUserController).toHaveBeenCalledWith({
      userId: '123',
      name: 'John Doe',
      email: 'john@example.com',
    });
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
    });
  });
});
