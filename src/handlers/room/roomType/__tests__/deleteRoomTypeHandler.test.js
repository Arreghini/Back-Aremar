// src/handlers/room/roomType/__tests__/deleteRoomTypeHandler.test.js
const request = require('supertest');
const express = require('express');
const deleteRoomTypeHandler = require('../deleteRoomTypeHandler');
const deleteRoomTypeController = require('../../../../controllers/room/roomType/deleteRoomTypeController');

// Mock del controlador
jest.mock('../../../../controllers/room/roomType/deleteRoomTypeController');

describe('DELETE /room-type/:id', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.delete('/room-type/:id', deleteRoomTypeHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería responder 200 y confirmar eliminación cuando el controlador funciona', async () => {
    deleteRoomTypeController.mockResolvedValue();

    const res = await request(app).delete('/room-type/123');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      deleted: true,
      id: '123',
    });
    expect(deleteRoomTypeController).toHaveBeenCalledWith('123');
    expect(deleteRoomTypeController).toHaveBeenCalledTimes(1);
  });

  it('debería responder 500 cuando el controlador lanza un error', async () => {
    deleteRoomTypeController.mockRejectedValue(new Error('Error eliminando'));

    const res = await request(app).delete('/room-type/999');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      deleted: false,
      error: 'Error eliminando',
    });
    expect(deleteRoomTypeController).toHaveBeenCalledWith('999');
    expect(deleteRoomTypeController).toHaveBeenCalledTimes(1);
  });
});
