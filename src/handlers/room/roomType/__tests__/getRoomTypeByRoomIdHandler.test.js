// src/handlers/room/roomType/__tests__/getRoomTypeByRoomIdHandler.test.js
const request = require('supertest');
const express = require('express');
const getRoomTypeByRoomIdHandler = require('../getRoomTypeByRoomIdHandler');
const getRoomTypeByRoomIdController = require('../../../../controllers/room/roomType/getRoomTypeByRoomIdController');

// Mock del controlador
jest.mock('../../../../controllers/room/roomType/getRoomTypeByRoomIdController');

describe('GET /room-type/:roomId', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.get('/room-type/:roomId', getRoomTypeByRoomIdHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería responder 200 con el tipo de habitación cuando existe', async () => {
    const mockRoomType = { id: 'RT1', name: 'Suite' };
    getRoomTypeByRoomIdController.mockResolvedValue(mockRoomType);

    const res = await request(app).get('/room-type/101');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockRoomType);
    expect(getRoomTypeByRoomIdController).toHaveBeenCalledWith('101');
    expect(getRoomTypeByRoomIdController).toHaveBeenCalledTimes(1);
  });

  it('debería responder 404 cuando no se encuentra el tipo de habitación', async () => {
    getRoomTypeByRoomIdController.mockResolvedValue(null);

    const res = await request(app).get('/room-type/999');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Room not found' });
    expect(getRoomTypeByRoomIdController).toHaveBeenCalledWith('999');
    expect(getRoomTypeByRoomIdController).toHaveBeenCalledTimes(1);
  });

  it('debería responder 500 cuando ocurre un error en el controlador', async () => {
    getRoomTypeByRoomIdController.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/room-type/500');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: 'DB error' });
    expect(getRoomTypeByRoomIdController).toHaveBeenCalledWith('500');
    expect(getRoomTypeByRoomIdController).toHaveBeenCalledTimes(1);
  });
});
