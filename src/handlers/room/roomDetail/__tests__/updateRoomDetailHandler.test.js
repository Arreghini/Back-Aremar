const httpMocks = require('node-mocks-http');
const updateDetailHandler = require('../updateRoomDetailHandler');
const updateDetailController = require('../../../../controllers/room/roomDetail/updateRoomDetailController');

jest.mock('../../../../controllers/room/roomDetail/updateRoomDetailController');

describe('updateRoomDetailHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe responder 200 y retornar el RoomDetail actualizado', async () => {
    const mockId = '1';
    const mockBody = { name: 'Nuevo nombre' };
    const mockResult = { id: 1, name: 'Nuevo nombre' };
    updateDetailController.mockResolvedValue(mockResult);

    const req = httpMocks.createRequest({ method: 'PATCH', params: { id: mockId }, body: mockBody });
    const res = httpMocks.createResponse();

    await updateDetailHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      message: 'RoomDetail actualizado con éxito',
      data: mockResult,
    });
    expect(updateDetailController).toHaveBeenCalledWith(mockId, mockBody);
  });

  it('debe responder 404 si el RoomDetail no existe', async () => {
    updateDetailController.mockResolvedValue(null);

    const req = httpMocks.createRequest({ method: 'PATCH', params: { id: '999' }, body: { name: 'X' } });
    const res = httpMocks.createResponse();

    await updateDetailHandler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: 'RoomDetail no encontrado' });
    expect(updateDetailController).toHaveBeenCalledWith('999', { name: 'X' });
  });

  it('debe responder 500 ante un error inesperado', async () => {
    updateDetailController.mockRejectedValue(new Error('Error inesperado'));

    const req = httpMocks.createRequest({ method: 'PATCH', params: { id: '1' }, body: { name: 'X' } });
    const res = httpMocks.createResponse();

    await updateDetailHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getData()).toBe('Error al manejar la solicitud');
  });
});