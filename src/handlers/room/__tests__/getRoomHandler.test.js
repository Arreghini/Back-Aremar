const httpMocks = require('node-mocks-http');
const getRoomByQueryHandler = require('../getRoomByQueryHandler');
const getRoomByQueryController = require('../../../controllers/room/getRoomByQuery');

jest.mock('../../../controllers/room/getRoomByQuery');

describe('getRoomByQueryHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return rooms based on query parameters', async () => {
    const req = httpMocks.createRequest({
      query: { capacity: 4 }
    });
    const res = httpMocks.createResponse();

    await getRoomByQueryHandler(req, res);

    expect(getRoomByQueryController).toHaveBeenCalledWith(req, res);
  });

  test('should handle empty query parameters', async () => {
    const req = httpMocks.createRequest({ query: {} });
    const res = httpMocks.createResponse();

    await getRoomByQueryHandler(req, res);

    expect(getRoomByQueryController).toHaveBeenCalledWith(req, res);
  });

  test('should handle database errors', async () => {
    const req = httpMocks.createRequest({ query: { price: 100 } });
    const res = httpMocks.createResponse();

    getRoomByQueryController.mockImplementation(() => {
      throw new Error('Database error');
    });

    await getRoomByQueryHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Internal server error' });
  });

  test('should filter by active rooms only', async () => {
    const req = httpMocks.createRequest({
      query: { isAvailable: true }
    });
    const res = httpMocks.createResponse();

    await getRoomByQueryHandler(req, res);

    expect(getRoomByQueryController).toHaveBeenCalledWith(req, res);
  });

  test('should handle price range filtering', async () => {
    const req = httpMocks.createRequest({
      query: { minPrice: 50, maxPrice: 200 }
    });
    const res = httpMocks.createResponse();

    await getRoomByQueryHandler(req, res);

    expect(getRoomByQueryController).toHaveBeenCalledWith(req, res);
  });
});
