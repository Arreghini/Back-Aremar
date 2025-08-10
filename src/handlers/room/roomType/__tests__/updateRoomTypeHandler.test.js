// src/handlers/room/roomType/__tests__/updateRoomTypeHandler.test.js
const request = require('supertest');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Importar el handler
const updateRoomTypeHandler = require('../updateRoomTypeHandler');
const updateRoomTypeController = require('../../../../controllers/room/roomType/updateRoomTypeController');
const uploadImageController = require('../../../../controllers/image/uploadImageController');

// Mocks
jest.mock('../../../../controllers/room/roomType/updateRoomTypeController');
jest.mock('../../../../controllers/image/uploadImageController');

describe('PATCH /room-type/:id', () => {
  let app;

  beforeAll(() => {
    app = express();
    const upload = multer({ dest: 'uploads/' }); // Para simular req.files

    // Middleware para parsear JSON y multipart/form-data
    app.use(express.json());
    app.patch(
      '/room-type/:id',
      upload.array('files'),
      updateRoomTypeHandler
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería responder 400 si no se envía el ID', async () => {
    const res = await request(app).patch('/room-type/').send({ name: 'Suite' });
    expect(res.statusCode).toBe(404); // Express devuelve 404 si no hay :id en la ruta
  });

  it('debería responder 200 cuando se actualiza con éxito sin archivos', async () => {
    const mockUpdated = { id: '1', name: 'Suite Lujo' };
    updateRoomTypeController.mockResolvedValue(mockUpdated);

    const res = await request(app)
      .patch('/room-type/1')
      .send({ name: 'Suite Lujo' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: 'RoomType actualizado con éxito',
      data: mockUpdated,
    });
    expect(updateRoomTypeController).toHaveBeenCalledWith('1', { name: 'Suite Lujo' });
  });

  it('debería procesar archivos y combinarlos con existingPhotos', async () => {
    const mockUpdated = { id: '2', name: 'Suite con fotos', photos: ['old.jpg', 'new.jpg'] };
    updateRoomTypeController.mockResolvedValue(mockUpdated);
    uploadImageController.mockResolvedValue({ secure_url: 'new.jpg' });

    const res = await request(app)
      .patch('/room-type/2')
      .field('name', 'Suite con fotos')
      .field('existingPhotos', JSON.stringify(['old.jpg']))
      .attach('files', Buffer.from('test file'), 'test.jpg');

    expect(res.statusCode).toBe(200);
    expect(uploadImageController).toHaveBeenCalled();
    expect(updateRoomTypeController).toHaveBeenCalledWith('2', {
      name: 'Suite con fotos',
      existingPhotos: JSON.stringify(['old.jpg']),
      photos: ['old.jpg', 'new.jpg'],
    });
  });

  it('debería responder 404 si el controlador devuelve null', async () => {
    updateRoomTypeController.mockResolvedValue(null);

    const res = await request(app)
      .patch('/room-type/999')
      .send({ name: 'No existe' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: 'RoomType no encontrado',
    });
  });

  it('debería responder 500 en error inesperado', async () => {
    updateRoomTypeController.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .patch('/room-type/3')
      .send({ name: 'Error test' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      error: 'Error interno del servidor',
      details: 'DB error',
    });
  });
});
