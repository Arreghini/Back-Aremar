const httpMocks = require('node-mocks-http');
const createRoomHandler = require('../createRoomHandler');
const createRoomController = require('../../../controllers/room/createRoomController');

jest.mock('../../../controllers/room/createRoomController');

const mockRoom = {
  id: '123',
  price: 100,
  capacity: 2,
  description: 'Test room'
};

describe('createRoomHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create room successfully', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: mockRoom
    });
    const res = httpMocks.createResponse();

    createRoomController.mockResolvedValue(mockRoom);

    await createRoomHandler(req, res);

    expect(res.statusCode).toBe(201);
    expect(JSON.parse(res._getData())).toEqual(mockRoom);
    expect(createRoomController).toHaveBeenCalledWith(mockRoom);
  });

  test('should return 400 when missing id', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        price: 100,
        capacity: 2,
        description: 'Test room'
      }
    });
    const res = httpMocks.createResponse();

    await createRoomHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Missing required fields' });
  });

  test('should return 400 when missing price', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        id: '123',
        capacity: 2,
        description: 'Test room'
      }
    });
    const res = httpMocks.createResponse();

    await createRoomHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Missing required fields' });
  });

  test('should return 400 when price is negative', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        id: '123',
        price: -100,
        capacity: 2,
        description: 'Test room'
      }
    });
    const res = httpMocks.createResponse();

    await createRoomHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Price must be positive' });
  });

  test('should return 400 when capacity is zero', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        id: '123',
        price: 100,
        capacity: 0,
        description: 'Test room'
      }
    });
    const res = httpMocks.createResponse();

    await createRoomHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Capacity must be positive' });
  });

  test('should handle controller errors', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: mockRoom
    });
    const res = httpMocks.createResponse();

    createRoomController.mockRejectedValue(new Error('Database error'));

    await createRoomHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Internal server error' });
  });

  test('should return 400 when missing description', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        id: '123',
        price: 100,
        capacity: 2
      }
    });
    const res = httpMocks.createResponse();

    await createRoomHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Missing required fields' });
  });
});
