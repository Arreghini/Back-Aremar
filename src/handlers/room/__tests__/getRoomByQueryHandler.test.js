const httpMocks = require('node-mocks-http');
const getRoomByQueryHandler = require('../getRoomByQueryHandler');
const getRoomByQueryController = require('../../../controllers/room/getRoomByQuery');
const { Room } = require('../../../models');

jest.mock('../../../controllers/room/getRoomByQuery'); // El controller lo manejás por separado
jest.mock('../../../models', () => ({
  Room: {
    findAll: jest.fn()
  }
}));

describe('getRoomByQueryHandler', () => {
  let req, res;

  const mockRooms = [
    { id: '1', name: 'Room 1', capacity: 4, price: 100, isActive: true },
    { id: '2', name: 'Room 2', capacity: 2, price: 50, isActive: true }
  ];

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: 'GET',
      url: '/rooms',
      query: {}
    });
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  test('should return rooms successfully', async () => {
    getRoomByQueryController.mockImplementation(async (req, res) => {
      res.status(200).json(mockRooms);
    });

    await getRoomByQueryHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(mockRooms);
  });

  test('should handle controller error gracefully', async () => {
    getRoomByQueryController.mockImplementation(() => {
      throw new Error('Test error');
    });

    await getRoomByQueryHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Internal server error' });
  });
});
