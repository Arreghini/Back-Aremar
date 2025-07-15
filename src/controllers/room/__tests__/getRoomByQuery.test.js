const getRoomByQuery = require('../getRoomByQuery');
const { Room } = require('../../../models');

jest.mock('../../../models');

describe('getRoomByQuery', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test('should return all rooms when no query parameters provided', async () => {
    Room.findAll.mockResolvedValue([{ id: '1', name: 'Room 1' }]);
    
    await getRoomByQuery({ query: {} }, res);
    
    expect(Room.findAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: '1', name: 'Room 1' }]);
  });

  test('should filter rooms by status', async () => {
    const req = { query: { status: 'available' } };
    Room.findAll.mockResolvedValue([{ id: '2', status: 'available' }]);

    await getRoomByQuery(req, res);

    expect(Room.findAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('should filter rooms by price range', async () => {
    const req = { query: { price: '100-200' } };
    Room.findAll.mockResolvedValue([{ id: '3', price: 150 }]);

    await getRoomByQuery(req, res);

    expect(Room.findAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('should handle database error', async () => {
    const req = { query: {} };
    Room.findAll.mockRejectedValue(new Error('Database error'));

    await getRoomByQuery(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
  });

  test('should return empty array when no rooms match criteria', async () => {
    const req = { query: { beds: 10 } };
    Room.findAll.mockResolvedValue([]);

    await getRoomByQuery(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('should filter by roomTypeId', async () => {
    const req = { query: { roomTypeId: 'suite' } };
    Room.findAll.mockResolvedValue([{ id: '4', roomTypeId: 'suite' }]);

    await getRoomByQuery(req, res);

    expect(Room.findAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
});
