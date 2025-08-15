// __tests__/getAllRoomDetailsHandler.test.js
const request = require('supertest');
const express = require('express');

const getAllRoomDetailsController = require('../../../../controllers/room/roomDetail/getAllRoomDetailsController');
const getAllRoomDetailsHandler = require('../getAllRoomDetailsHandler');

// Mock del controlador
jest.mock('../../../../controllers/room/roomDetail/getAllRoomDetailsController');

describe('GET /room-details (getAllRoomDetailsHandler)', () => {
  let app;

  beforeAll(() => {
    app = express();
    // Ruta de prueba
    app.get('/room-details', getAllRoomDetailsHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe devolver 200 y los datos cuando el controlador responde bien', async () => {
    const mockRoomDetails = [
      { id: 1, name: 'Detalle 1' },
      { id: 2, name: 'Detalle 2' },
    ];

    getAllRoomDetailsController.mockResolvedValue(mockRoomDetails);

    const res = await request(app).get('/room-details');

    expect(getAllRoomDetailsController).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: mockRoomDetails,
    });
  });

  it('debe devolver 500 cuando el controlador lanza un error', async () => {
    getAllRoomDetailsController.mockRejectedValue(new Error('Error en base de datos'));

    const res = await request(app).get('/room-details');

    expect(getAllRoomDetailsController).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: 'Error interno del servidor',
    });
  });
});
