const httpMocks = require('node-mocks-http');
const getDetailHandler = require('../getRoomDetailHandler');
const getDetailController = require('../../../../controllers/room/roomDetail/getRoomDetailController');

jest.mock('../../../../controllers/room/roomDetail/getRoomDetailController');

describe('getRoomDetailHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe responder 200 y retornar los detalles de habitación', async () => {
    const mockDetails = [{ id: 1, name: 'Detalle 1' }, { id: 2, name: 'Detalle 2' }];
    getDetailController.mockResolvedValue(mockDetails);

    const req = httpMocks.createRequest({ method: 'GET' });
    const res = httpMocks.createResponse();

    await getDetailHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(mockDetails);
    expect(getDetailController).toHaveBeenCalled();
  });

  it('debe responder 500 ante un error inesperado', async () => {
    getDetailController.mockRejectedValue(new Error('Error inesperado'));

    const req = httpMocks.createRequest({ method: 'GET' });
    const res = httpMocks.createResponse();

    await getDetailHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getData()).toBe('Error al manejar la solicitud');
  });
});