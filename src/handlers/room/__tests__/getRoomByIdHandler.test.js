jest.mock('../../../controllers/room/getRoomByIdController', () => jest.fn());

const httpMocks = require('node-mocks-http');
const getRoomByIdHandler = require('../getRoomByIdHandler');
const getRoomByIdController = require('../../../controllers/room/getRoomByIdController'); // esta vez sí es mock

const mockRoom = {
  id: 1,
  name: 'Test Room',
  capacity: 4,
  price: 100,
  isAvailable: true
};

describe('getRoomByIdHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should get room by id successfully', async () => {
    const req = httpMocks.createRequest({ params: { id: '1' } });
    const res = httpMocks.createResponse();

    getRoomByIdController.mockResolvedValue(mockRoom);

    await getRoomByIdHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(mockRoom);
  });

  test('should return 404 when room not found', async () => {
    const req = httpMocks.createRequest({ params: { id: '999' } });
    const res = httpMocks.createResponse();

    getRoomByIdController.mockResolvedValue(null);

    await getRoomByIdHandler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ message: 'Room not found' });
  });

test('should handle invalid id parameter', async () => {
  const req = httpMocks.createRequest({ params: { id: 'abc' } });
  const res = httpMocks.createResponse();

  await getRoomByIdHandler(req, res);

  expect(res.statusCode).toBe(404);
  expect(res._getJSONData()).toEqual({ message: 'Room not found' });
}

  test('should handle missing id parameter', async () => {
    const req = httpMocks.createRequest({ params: {} });
    const res = httpMocks.createResponse();

    await getRoomByIdHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'Room ID is required' });
  });

  test('should handle database errors', async () => {
    const req = httpMocks.createRequest({ params: { id: '1' } });
    const res = httpMocks.createResponse();

    getRoomByIdController.mockRejectedValue(new Error('Database error'));

    await getRoomByIdHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Database error' });
  });
});
