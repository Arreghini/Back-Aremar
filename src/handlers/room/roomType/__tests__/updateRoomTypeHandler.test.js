const request = require('supertest');
const express = require('express');
const multer = require('multer');

// Mocks
jest.mock('../../../../controllers/room/roomType/updateRoomTypeController.js');
jest.mock('../../../../controllers/image/uploadImageController.js', () => {
  return jest.fn((file, folder) => Promise.resolve({ secure_url: 'new.jpg' }));
});

const updateRoomTypeHandler = require('../updateRoomTypeHandler.js');
const updateRoomTypeController = require('../../../../controllers/room/roomType/updateRoomTypeController.js');
const uploadImageController = require('../../../../controllers/image/uploadImageController.js');

describe('PATCH /room-type/:id', () => {
  let app;

  beforeAll(() => {
    app = express();
    const upload = multer({ dest: 'uploads/' });
    app.use(express.json());
    app.patch('/room-type/:id', upload.array('files'), updateRoomTypeHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería responder 400 si no se envía el ID', async () => {
    const res = await request(app).patch('/room-type/').send({ name: 'Suite' });
    expect(res.statusCode).toBe(404); // Express responde 404 porque falta el param :id
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

  it('debería responder 404 si el controlador devuelve null (tipo no encontrado)', async () => {
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

  it('debería manejar error al parsear existingPhotos malformado', async () => {
    const mockUpdated = { id: '4', name: 'Suite Mal Formateada', photos: ['new.jpg'] };
    updateRoomTypeController.mockResolvedValue(mockUpdated);

    const res = await request(app)
      .patch('/room-type/4')
      .field('name', 'Suite Mal Formateada')
      .field('existingPhotos', 'esto no es JSON')
      .attach('files', Buffer.from('test file'), 'test.jpg');

    expect(res.statusCode).toBe(200);
    expect(uploadImageController).toHaveBeenCalled();
    expect(updateRoomTypeController).toHaveBeenCalledWith('4', {
      name: 'Suite Mal Formateada',
      existingPhotos: 'esto no es JSON',
      photos: ['new.jpg'],
    });
  });

  it('debería actualizar sin enviar existingPhotos ni archivos', async () => {
    const mockUpdated = { id: '5', name: 'Solo nombre cambiado' };
    updateRoomTypeController.mockResolvedValue(mockUpdated);

    const res = await request(app)
      .patch('/room-type/5')
      .send({ name: 'Solo nombre cambiado' });

    expect(res.statusCode).toBe(200);
    expect(updateRoomTypeController).toHaveBeenCalledWith('5', { name: 'Solo nombre cambiado' });
  });
});
