const httpMocks = require('node-mocks-http');
const deleteRoomHandler = require('../deleteRoomHandler');
const deleteRoomController = require('../../../controllers/room/deleteRoomController');

jest.mock('../../../controllers/room/deleteRoomController'); // Mock del controller

describe('deleteRoomHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should delete room successfully', async () => {
    const req = httpMocks.createRequest({ params: { id: 'P1D2' } });
    const res = httpMocks.createResponse();

    deleteRoomController.mockResolvedValue(true); // indica que se eliminó

    await deleteRoomHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ message: 'Room deleted successfully' });
  });

  test('should handle non-existent room', async () => {
    const req = httpMocks.createRequest({ params: { id: 'P9D9' } });
    const res = httpMocks.createResponse();

    deleteRoomController.mockResolvedValue(null); // no se encontró

    await deleteRoomHandler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ message: 'Room not found' });
  });

  test('should handle missing room id', async () => {
    const req = httpMocks.createRequest({ params: {} });
    const res = httpMocks.createResponse();

    await deleteRoomHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'Missing or invalid room id' });
  });

  test('should handle empty room id', async () => {
    const req = httpMocks.createRequest({ params: { id: '' } });
    const res = httpMocks.createResponse();

    await deleteRoomHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'Missing or invalid room id' });
  });

  test('should handle database errors', async () => {
    const req = httpMocks.createRequest({ params: { id: 'P1D2' } });
    const res = httpMocks.createResponse();

    deleteRoomController.mockRejectedValue(new Error('Database error'));

    await deleteRoomHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Database error' });
  });

  test('should handle foreign key constraint errors', async () => {
    const req = httpMocks.createRequest({ params: { id: 'P1D2' } });
    const res = httpMocks.createResponse();

    const fkError = new Error('foreign key constraint');
    fkError.name = 'SequelizeForeignKeyConstraintError';

    deleteRoomController.mockRejectedValue(fkError);

    await deleteRoomHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      message: 'Cannot delete room: it has related reservations or other dependencies',
    });
  });
});
