const deleteUserHandler = require('../deleteUserHandler');
const deleteUserController = require('../../../controllers/user/deleteUserController');

jest.mock('../../../controllers/user/deleteUserController');

describe('deleteUserHandler', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: '123' }, headers: {}, user: { sub: 'user|1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('devuelve 400 si no se proporciona id', async () => {
    req.params.id = undefined;
    await deleteUserHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User ID is required' });
  });

  it('devuelve 404 si el usuario no existe', async () => {
    deleteUserController.mockResolvedValue(null);
    await deleteUserHandler(req, res);
    expect(deleteUserController).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('devuelve 200 si el usuario se elimina correctamente', async () => {
    deleteUserController.mockResolvedValue({ id: '123' });
    await deleteUserHandler(req, res);
    expect(deleteUserController).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
  });

  it('devuelve 500 si ocurre un error', async () => {
    deleteUserController.mockRejectedValue(new Error('fail'));
    await deleteUserHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'fail' });
  });
});