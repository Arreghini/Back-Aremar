const httpMocks = require('node-mocks-http');
const getAllUsersHandler = require('../getAllUsersHandler');
const { User } = require('../../../models');

jest.mock('../../../models');

const mockUsers = [
  { id: 1, name: 'Alice', email: 'alice@test.com' },
  { id: 2, name: 'Bob', email: 'bob@test.com' },
];

describe('getAllUsersHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return all users successfully', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    User.findAll.mockResolvedValue(mockUsers);

    await getAllUsersHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(mockUsers);
  });

  test('should return empty array when no users exist', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    User.findAll.mockResolvedValue([]);

    await getAllUsersHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual([]);
  });

  test('should handle database errors', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    User.findAll.mockRejectedValue(new Error('Database error'));

    await getAllUsersHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Database error' });
  });

  test('should apply filters when provided', async () => {
    const req = httpMocks.createRequest({
      query: { name: 'Alice' },
    });
    const res = httpMocks.createResponse();

    User.findAll.mockResolvedValue([mockUsers[0]]);

    await getAllUsersHandler(req, res);

    expect(User.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { name: 'Alice' },
    }));

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual([mockUsers[0]]);
  });

  test('should handle invalid filter parameters', async () => {
    const req = httpMocks.createRequest({
      query: { age: 'unknown' }, // suponiendo que 'age' no está permitido
    });
    const res = httpMocks.createResponse();

    User.findAll.mockImplementation(() => {
      throw new Error('Invalid filter parameter');
    });

    await getAllUsersHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Invalid filter parameter' });
  });

  test('should handle sorting parameters', async () => {
    const req = httpMocks.createRequest({
      query: { sortBy: 'name', sortOrder: 'ASC' },
    });
    const res = httpMocks.createResponse();

    User.findAll.mockResolvedValue([mockUsers[1], mockUsers[0]]);

    await getAllUsersHandler(req, res);

    expect(User.findAll).toHaveBeenCalledWith(expect.objectContaining({
      order: [['name', 'ASC']],
    }));

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual([mockUsers[1], mockUsers[0]]);
  });

  test('should handle pagination parameters', async () => {
    const req = httpMocks.createRequest({
      query: { limit: '1', offset: '1' },
    });
    const res = httpMocks.createResponse();

    User.findAll.mockResolvedValue([mockUsers[1]]);

    await getAllUsersHandler(req, res);

    expect(User.findAll).toHaveBeenCalledWith(expect.objectContaining({
      limit: 1,
      offset: 1,
    }));

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual([mockUsers[1]]);
  });

  test('should combine filters, sorting and pagination', async () => {
    const req = httpMocks.createRequest({
      query: {
        name: 'Bob',
        sortBy: 'name',
        sortOrder: 'DESC',
        limit: '1',
        offset: '0',
      },
    });
    const res = httpMocks.createResponse();

    User.findAll.mockResolvedValue([mockUsers[1]]);

    await getAllUsersHandler(req, res);

    expect(User.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { name: 'Bob' },
      order: [['name', 'DESC']],
      limit: 1,
      offset: 0,
    }));

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual([mockUsers[1]]);
  });

  test('should handle null filter parameters', async () => {
    const req = httpMocks.createRequest({
      query: { name: null },
    });
    const res = httpMocks.createResponse();

    User.findAll.mockResolvedValue(mockUsers);

    await getAllUsersHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(mockUsers);
  });

  test('should handle undefined options parameter', async () => {
    const req = httpMocks.createRequest(); // sin query
    const res = httpMocks.createResponse();

    User.findAll.mockResolvedValue(mockUsers);

    await getAllUsersHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(mockUsers);
  });
});
