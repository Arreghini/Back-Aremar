// __tests__/createRoomDetailWithoutIdHandler.test.js
const request = require('supertest');
const express = require('express');

const createDetailController = require('../../../../controllers/room/roomDetail/createRoomDetailController');
const createRoomDetailWithoutIdHandler = require('../createRoomDetailWithoutIdHandler');

jest.mock('../../../../controllers/room/roomDetail/createRoomDetailController');

describe('POST /room-details (createRoomDetailWithoutIdHandler)', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.post('/room-details', createRoomDetailWithoutIdHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe devolver 201 y los datos creados cuando todo es correcto', async () => {
    const mockData = { name: 'Vista al mar', description: 'Habitación con balcón' };
    createDetailController.mockResolvedValue(mockData);

    const res = await request(app)
      .post('/room-details')
      .send(mockData);

    expect(createDetailController).toHaveBeenCalledWith(mockData);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, data: mockData });
  });

  it('debe devolver 400 si no se envían datos', async () => {
    const res = await request(app)
      .post('/room-details')
      .send({}); // cuerpo vacío

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Datos de entrada inválidos' });
    expect(createDetailController).not.toHaveBeenCalled();
  });

  it('debe devolver 400 si ya existe un RoomDetail con el mismo ID', async () => {
    createDetailController.mockRejectedValue(new Error('RoomDetail con este ID ya existe'));

    const mockData = { name: 'Vista al mar' };
    const res = await request(app)
      .post('/room-details')
      .send(mockData);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'RoomDetail con este ID ya existe' });
  });

  it('debe devolver 500 si ocurre un error inesperado', async () => {
    createDetailController.mockRejectedValue(new Error('Fallo inesperado'));

    const mockData = { name: 'Vista al mar' };
    const res = await request(app)
      .post('/room-details')
      .send(mockData);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error interno del servidor' });
  });
});
