const httpMocks = require('node-mocks-http');
const deleteRoomHandler = require('../deleteRoomHandler');
const deleteRoomController = require('../../../controllers/room/deleteRoomController'); // Importalo explícitamente

jest.mock('../../../controllers/room/deleteRoomController'); // Mockealo para Jest


jest.mock('../../../models');

describe('deleteRoomHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should delete room successfully', async () => {
    const req = httpMocks.createRequest({ params: { id: '1' } });
    const res = httpMocks.createResponse();

    deleteRoomController.mockResolvedValue(true); // indica que sí se eliminó

    await deleteRoomHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ message: 'Room deleted successfully' });
  });

  test('should handle non-existent room', async () => {
    const req = httpMocks.createRequest({ params: { id: '999' } });
    const res = httpMocks.createResponse();

    deleteRoomController.mockResolvedValue(null); // indica que no se encontró

    await deleteRoomHandler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ message: 'Room not found' });
  });

  test('should handle missing room id', async () => {
    const req = httpMocks.createRequest({ params: {} });
    const res = httpMocks.createResponse();

    await deleteRoomHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'Missing room id' });
  });

  test('should handle invalid room id format', async () => {
    const req = httpMocks.createRequest({ params: { id: 'abc' } });
    const res = httpMocks.createResponse();

    await deleteRoomHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'Invalid room ID format' });
  });

  test('should handle database errors', async () => {
    const req = httpMocks.createRequest({ params: { id: '1' } });
    const res = httpMocks.createResponse();

    deleteRoomController.mockRejectedValue(new Error('Database error'));

    await deleteRoomHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Database error' });
  });
});
