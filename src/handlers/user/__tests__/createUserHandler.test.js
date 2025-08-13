// tests/handlers/createUserHandler.test.js
const httpMocks = require('node-mocks-http');
const { v4: uuidv4 } = require('uuid');
const createUserHandler = require('../../../handlers/user/createUserHandler');
const userCreateController = require('../../../controllers/user/createUserController');

jest.mock('uuid');
jest.mock('../../../controllers/user/createUserController');

describe('createUserHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe generar un id si no está presente', async () => {
    const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
    uuidv4.mockReturnValue(mockUUID);

    const req = httpMocks.createRequest({
      method: 'POST',
      body: { name: 'John Doe' }
    });
    const res = httpMocks.createResponse();

    const mockUser = { id: mockUUID, name: 'John Doe' };
    userCreateController.mockResolvedValue(mockUser);

    await createUserHandler(req, res);

    expect(uuidv4).toHaveBeenCalled();
    expect(userCreateController).toHaveBeenCalledWith({ id: mockUUID, name: 'John Doe' });
    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual({
      message: 'Cliente creado exitosamente',
      user: mockUser
    });
  });

  it('no debe generar id si ya está presente', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { id: 'fixed-id', name: 'Jane Doe' }
    });
    const res = httpMocks.createResponse();

    const mockUser = { id: 'fixed-id', name: 'Jane Doe' };
    userCreateController.mockResolvedValue(mockUser);

    await createUserHandler(req, res);

    expect(uuidv4).not.toHaveBeenCalled();
    expect(userCreateController).toHaveBeenCalledWith({ id: 'fixed-id', name: 'Jane Doe' });
    expect(res.statusCode).toBe(201);
  });

  it('debe devolver 400 si el id ya existe', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { id: 'existing-id', name: 'Dup User' }
    });
    const res = httpMocks.createResponse();

    userCreateController.mockRejectedValue(new Error('User with this ID already exists'));

    await createUserHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'User with this ID already exists' });
  });

  it('debe devolver 500 en error inesperado', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { name: 'Error User' }
    });
    const res = httpMocks.createResponse();

    userCreateController.mockRejectedValue(new Error('Unexpected DB error'));

    await createUserHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getData()).toBe('Error al manejar la solicitud');
  });
});
