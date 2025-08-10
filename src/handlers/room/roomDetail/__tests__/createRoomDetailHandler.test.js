const httpMocks = require('node-mocks-http');
const createDetailHandler = require('../createRoomDetailHandler');
const createDetailController = require('../../../../controllers/room/roomDetail/createRoomDetailController');

jest.mock('../../../../controllers/room/roomDetail/createRoomDetailController');

describe('createRoomDetailHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe responder 201 y retornar el RoomDetail creado', async () => {
    const mockBody = { id: 1, name: 'Detalle' };
    const mockResult = { id: 1, name: 'Detalle' };
    createDetailController.mockResolvedValue(mockResult);

    const req = httpMocks.createRequest({ method: 'POST', body: mockBody });
    const res = httpMocks.createResponse();

    await createDetailHandler(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual({
      message: 'RoomDetail creado con éxito',
      data: mockResult,
    });
    expect(createDetailController).toHaveBeenCalledWith(mockBody);
  });

  it('debe responder 400 si el error es por ID duplicado', async () => {
    const mockBody = { id: 1, name: 'Detalle' };
    createDetailController.mockRejectedValue(new Error('RoomDetail con este ID ya existe'));

    const req = httpMocks.createRequest({ method: 'POST', body: mockBody });
    const res = httpMocks.createResponse();

    await createDetailHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'RoomDetail con este ID ya existe' });
  });

  it('debe responder 500 ante un error inesperado', async () => {
    const mockBody = { id: 1, name: 'Detalle' };
    createDetailController.mockRejectedValue(new Error('Error inesperado'));

    const req = httpMocks.createRequest({ method: 'POST', body: mockBody });
    const res = httpMocks.createResponse();

    await createDetailHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getData()).toBe('Error al manejar la solicitud');
  });
});