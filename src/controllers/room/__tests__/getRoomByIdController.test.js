jest.mock('../../../controllers/room/getRoomByIdController');
const httpMocks = require('node-mocks-http');
const  getRoomByIdHandler  = require('../../../handlers/room/getRoomByIdHandler');
const  getRoomByIdController  = require('../../../controllers/room/getRoomByIdController');
const { Room, RoomType, RoomDetail } = require('../../../models');

jest.mock('../../../models');

describe('getRoomByIdHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return room data if room is found', async () => {
    const mockRoom = { id: '123', name: 'Room 1' };

    getRoomByIdController.mockResolvedValue(mockRoom);

    const req = httpMocks.createRequest({ method: 'GET', url: '/rooms/123', params: { id: '123' } });
    const res = httpMocks.createResponse();

    await getRoomByIdHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(mockRoom);
    expect(getRoomByIdController).toHaveBeenCalledWith('123');
  });

  it('should return 404 if room is not found', async () => {
    getRoomByIdController.mockResolvedValue(null);

    const req = httpMocks.createRequest({ method: 'GET', url: '/rooms/123', params: { id: '123' } });
    const res = httpMocks.createResponse();

    await getRoomByIdHandler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ message: 'Room not found' });
    expect(getRoomByIdController).toHaveBeenCalledWith('123');
  });

  it('should handle errors and return 500', async () => {
    getRoomByIdController.mockRejectedValue(new Error('Something went wrong'));

    const req = httpMocks.createRequest({ method: 'GET', url: '/rooms/123', params: { id: '123' } });
    const res = httpMocks.createResponse();

    await getRoomByIdHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Something went wrong' });
    expect(getRoomByIdController).toHaveBeenCalledWith('123');
  });
});
