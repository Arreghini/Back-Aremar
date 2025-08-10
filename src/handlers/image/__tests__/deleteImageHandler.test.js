// tests/handlers/deleteImageHandler.test.js
const request = require('supertest');
const express = require('express');

jest.mock('../../controllers/image/imageDeleteController');
const deleteImageController = require('../../controllers/image/imageDeleteController');
const deleteImageHandler = require('../../handlers/image/deleteImageHandler');

describe('deleteImageHandler', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.post('/delete-image', deleteImageHandler);
  });

  it('debe responder 200 y devolver resultado si elimina correctamente', async () => {
    const fakeResult = { success: true, message: 'Imagen eliminada' };
    deleteImageController.mockResolvedValue(fakeResult);

    const res = await request(app)
      .post('/delete-image')
      .send({ public_id: 'image123' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeResult);
    expect(deleteImageController).toHaveBeenCalledWith('image123');
  });

  it('debe responder 500 si deleteImageController lanza error', async () => {
    deleteImageController.mockRejectedValue(new Error('Fallo al eliminar'));

    const res = await request(app)
      .post('/delete-image')
      .send({ public_id: 'image123' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al eliminar la imagen' });
  });
});
