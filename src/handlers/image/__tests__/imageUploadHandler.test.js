// tests/handlers/uploadImageHandler.test.js
const request = require('supertest');
const express = require('express');

jest.mock('../../../controllers/image/uploadImageController');
const uploadImageController = require('../../../controllers/image/uploadImageController');

const {
  uploadMultipleImagesHandler,
  uploadSingleImageHandler,
} = require('../../../handlers/image/uploadImageHandler');

describe('uploadImages handlers', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());

    // Rutas para testear
    app.post('/upload-multiple', (req, res) => uploadMultipleImagesHandler(req, res));
    app.post('/upload-single', (req, res) => uploadSingleImageHandler(req, res));
  });

  describe('uploadMultipleImagesHandler', () => {
    it('debe responder 400 si no hay archivos', async () => {
      const res = await request(app).post('/upload-multiple').send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'No se enviaron archivos' });
    });

    it('debe subir múltiples archivos y responder 200 con resultados', async () => {
      const fakeResults = [{ url: 'url1' }, { url: 'url2' }];
      uploadImageController.mockImplementation((file, folder) =>
        Promise.resolve({ url: `uploaded_${file.originalname}_to_${folder}` })
      );

      // Simulamos req.files en la llamada manual (Supertest no soporta multipart con req.files directamente sin multer)
      // Aquí llamamos directo al handler con objeto simulado:
      const req = {
        files: [
          { originalname: 'file1.jpg' },
          { originalname: 'file2.png' },
        ],
        body: { folder: 'custom/folder' },
      };
      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));
      const res = { status: statusMock };

      await uploadMultipleImagesHandler(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith([
        { url: 'uploaded_file1.jpg_to_custom/folder' },
        { url: 'uploaded_file2.png_to_custom/folder' },
      ]);
      expect(uploadImageController).toHaveBeenCalledTimes(2);
      expect(uploadImageController).toHaveBeenCalledWith(req.files[0], 'custom/folder');
    });

    it('debe responder 500 si hay error al subir', async () => {
      uploadImageController.mockRejectedValue(new Error('upload failed'));

      const req = { files: [{ originalname: 'file1.jpg' }], body: {} };
      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));
      const res = { status: statusMock };

      await uploadMultipleImagesHandler(req, res);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Error al subir las imágenes' });
    });
  });

  describe('uploadSingleImageHandler', () => {
    it('debe responder 400 si no hay archivo', async () => {
      const req = { body: {} };
      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));
      const res = { status: statusMock };

      await uploadSingleImageHandler(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'No se envió archivo' });
    });

    it('debe subir un archivo y responder 200 con resultado', async () => {
      const fakeResult = { url: 'uploaded_file1_to_defaultfolder' };
      uploadImageController.mockResolvedValue(fakeResult);

      const req = {
        file: { originalname: 'file1.jpg' },
        body: {},
      };
      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));
      const res = { status: statusMock };

      await uploadSingleImageHandler(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(fakeResult);
      expect(uploadImageController).toHaveBeenCalledWith(req.file, 'aremar/roomtypes');
    });

    it('debe responder 500 si hay error al subir', async () => {
      uploadImageController.mockRejectedValue(new Error('upload failed'));

      const req = { file: { originalname: 'file1.jpg' }, body: {} };
      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));
      const res = { status: statusMock };

      await uploadSingleImageHandler(req, res);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Error al subir la imagen' });
    });
  });
});
