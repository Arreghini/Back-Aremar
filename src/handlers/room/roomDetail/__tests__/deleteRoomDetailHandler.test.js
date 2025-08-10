const httpMocks = require('node-mocks-http');
const deleteDetailHandler = require('../deleteRoomDetailHandler');
const deleteDetailController = require('../../../../controllers/room/roomDetail/deleteRoomDetailController');

jest.mock('../../../../controllers/room/roomDetail/deleteRoomDetailController');

describe('deleteRoomDetailHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe responder 200 si el RoomDetail se elimina correctamente', async () => {
    deleteDetailController.mockResolvedValue(true);

    const req = httpMocks.createRequest({ method: 'DELETE', params: { id: '1' } });
    const res = httpMocks.createResponse();

    await deleteDetailHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ message: 'RoomDetail eliminado con éxito' });
    expect(deleteDetailController).toHaveBeenCalledWith('1');
  });

  it('debe responder 404 si el RoomDetail no existe', async () => {
    deleteDetailController.mockResolvedValue(false);

    const req = httpMocks.createRequest({ method: 'DELETE', params: { id: '999' } });
    const res = httpMocks.createResponse();

    await deleteDetailHandler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: 'RoomDetail no encontrado' });
    expect(deleteDetailController).toHaveBeenCalledWith('999');
  });

  it('debe responder 500 ante un error inesperado', async () => {
    deleteDetailController.mockRejectedValue(new Error('Error inesperado'));

    const req = httpMocks.createRequest({ method: 'DELETE', params: { id: '1' } });
    const res = httpMocks.createResponse();

    await deleteDetailHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getData()).toBe('Error al manejar la solicitud');
  });
});