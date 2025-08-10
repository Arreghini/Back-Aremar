// src/handlers/room/roomType/__tests__/getRoomTypeHandler.test.js
const request = require('supertest');
const express = require('express');
const getRoomTypeHandler = require('../getRoomTypeHandler');
const getRoomTypeController = require('../../../../controllers/room/roomType/getRoomTypeController');

// Mock del controlador
jest.mock('../../../../controllers/room/roomType/getRoomTypeController');

describe('GET /room-type', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.get('/room-type', getRoomTypeHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería responder 200 con los tipos de habitación cuando el controlador funciona', async () => {
    const mockRoomTypes = [
      { id: 'RT1', name: 'Suite' },
      { id: 'RT2', name: 'Doble' },
    ];
    getRoomTypeController.mockResolvedValue(mockRoomTypes);

    const res = await request(app).get('/room-type');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: mockRoomTypes,
      message: 'Tipos de habitación obtenidos exitosamente',
    });
    expect(getRoomTypeController).toHaveBeenCalledTimes(1);
  });

  it('debería responder 500 cuando el controlador lanza un error', async () => {
    getRoomTypeController.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/room-type');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      error: 'Error al obtener los tipos de habitación',
      details: 'DB error',
    });
    expect(getRoomTypeController).toHaveBeenCalledTimes(1);
  });
});
