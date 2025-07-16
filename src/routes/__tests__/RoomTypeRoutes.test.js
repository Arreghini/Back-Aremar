const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');
const RoomTypeRoutes = require('../RoomTypeRoutes');

// Mocks de los handlers
jest.mock('../../handlers/room/roomType/getRoomTypeHandler');
jest.mock('../../handlers/room/roomType/createRoomTypeHandler');
jest.mock('../../handlers/room/roomType/updateRoomTypeHandler');
jest.mock('../../handlers/room/roomType/deleteRoomTypeHandler');

const getRoomTypeHandler = require('../../handlers/room/roomType/getRoomTypeHandler');
const createRoomTypeHandler = require('../../handlers/room/roomType/createRoomTypeHandler');
const updateRoomTypeHandler = require('../../handlers/room/roomType/updateRoomTypeHandler');
const deleteRoomTypeHandler = require('../../handlers/room/roomType/deleteRoomTypeHandler');

// Configuración de la app de prueba
const app = express();
app.use(express.json());

// Middleware para manejar errores de multer
app.use('/room-types', (error, req, res, next) => {
  if (error) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Archivo demasiado grande' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Demasiados archivos' });
    }
    if (error.message === 'Solo se permiten archivos de imagen') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: error.message });
  }
  next();
});

app.use('/room-types', RoomTypeRoutes);

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  if (error) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Archivo demasiado grande' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Demasiados archivos' });
    }
    if (error.message === 'Solo se permiten archivos de imagen') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  next();
});

describe('RoomTypeRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silenciar console.log para tests más limpios
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /', () => {
    it('debería obtener todos los tipos de habitación', async () => {
      const mockRoomTypes = [
        { id: 1, name: 'Suite', description: 'Habitación de lujo' },
        { id: 2, name: 'Estándar', description: 'Habitación básica' }
      ];

      getRoomTypeHandler.mockImplementation((req, res) => {
        res.status(200).json(mockRoomTypes);
      });

      const response = await request(app)
        .get('/room-types/')
        .expect(200);

      expect(response.body).toEqual(mockRoomTypes);
      expect(getRoomTypeHandler).toHaveBeenCalledTimes(1);
    });

    it('debería manejar errores al obtener tipos de habitación', async () => {
      getRoomTypeHandler.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Error interno del servidor' });
      });

      const response = await request(app)
        .get('/room-types/')
        .expect(500);

      expect(response.body).toEqual({ error: 'Error interno del servidor' });
    });
  });

  describe('POST /upload/multiple', () => {
    it('debería crear un tipo de habitación con imágenes', async () => {
      const mockRoomType = {
        id: 1,
        name: 'Suite Premium',
        description: 'Habitación de lujo con vista al mar',
        photos: ['photo1.jpg', 'photo2.jpg']
      };

      createRoomTypeHandler.mockImplementation((req, res) => {
        res.status(201).json(mockRoomType);
      });

      // Crear archivos de imagen simulados con el tipo MIME correcto
      const imageBuffer = Buffer.from('imagen simulada');

      const response = await request(app)
        .post('/room-types/upload/multiple')
        .attach('photos', imageBuffer, { filename: 'test1.jpg', contentType: 'image/jpeg' })
        .attach('photos', imageBuffer, { filename: 'test2.jpg', contentType: 'image/jpeg' })
        .field('name', 'Suite Premium')
        .field('description', 'Habitación de lujo con vista al mar')
        .expect(201);

      expect(response.body).toEqual(mockRoomType);
      expect(createRoomTypeHandler).toHaveBeenCalledTimes(1);
    });

    it('debería rechazar archivos que no sean imágenes', async () => {
      const textBuffer = Buffer.from('esto es un archivo de texto');

      const response = await request(app)
        .post('/room-types/upload/multiple')
        .attach('photos', textBuffer, { filename: 'test.txt', contentType: 'text/plain' })
        .field('name', 'Suite Premium')
        .expect(400);

      expect(response.body.error).toContain('Solo se permiten archivos de imagen');
    });

    it('debería rechazar archivos que excedan el límite de tamaño', async () => {
      // Crear un buffer de más de 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

      const response = await request(app)
        .post('/room-types/upload/multiple')
        .attach('photos', largeBuffer, { filename: 'large-image.jpg', contentType: 'image/jpeg' })
        .field('name', 'Suite Premium')
        .expect(413);

      expect(response.body.error).toBe('Archivo demasiado grande');
    });

    it('debería rechazar más de 10 archivos', async () => {
      const imageBuffer = Buffer.from('imagen simulada');
      let requestBuilder = request(app).post('/room-types/upload/multiple');

      // Intentar subir 11 archivos
      for (let i = 1; i <= 11; i++) {
        requestBuilder = requestBuilder.attach('photos', imageBuffer, { 
          filename: `test${i}.jpg`, 
          contentType: 'image/jpeg' 
        });
      }

      const response = await requestBuilder
        .field('name', 'Suite Premium')
        .expect(400);

      expect(response.body.error).toBe('Demasiados archivos');
    });

    it('debería manejar errores en la creación', async () => {
      createRoomTypeHandler.mockImplementation((req, res) => {
        res.status(400).json({ error: 'Datos inválidos' });
      });

      const imageBuffer = Buffer.from('imagen simulada');

      const response = await request(app)
        .post('/room-types/upload/multiple')
        .attach('photos', imageBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' })
        .field('name', '')
        .expect(400);

      expect(response.body).toEqual({ error: 'Datos inválidos' });
    });
  });

  describe('PATCH /:id', () => {
    it('debería actualizar un tipo de habitación', async () => {
      const mockUpdatedRoomType = {
        id: 1,
        name: 'Suite Premium Actualizada',
        description: 'Descripción actualizada',
        photos: ['new-photo.jpg']
      };

      updateRoomTypeHandler.mockImplementation((req, res) => {
        res.status(200).json(mockUpdatedRoomType);
      });

      const imageBuffer = Buffer.from('nueva imagen');

      const response = await request(app)
        .patch('/room-types/1')
        .attach('photos', imageBuffer, { filename: 'new-photo.jpg', contentType: 'image/jpeg' })
        .field('name', 'Suite Premium Actualizada')
        .field('description', 'Descripción actualizada')
        .expect(200);

      expect(response.body).toEqual(mockUpdatedRoomType);
      expect(updateRoomTypeHandler).toHaveBeenCalledTimes(1);
    });

    it('debería actualizar sin imágenes', async () => {
      const mockUpdatedRoomType = {
        id: 1,
        name: 'Suite Premium Actualizada',
        description: 'Solo texto actualizado'
      };

      updateRoomTypeHandler.mockImplementation((req, res) => {
        res.status(200).json(mockUpdatedRoomType);
      });

      const response = await request(app)
        .patch('/room-types/1')
        .field('name', 'Suite Premium Actualizada')
        .field('description', 'Solo texto actualizado')
        .expect(200);

      expect(response.body).toEqual(mockUpdatedRoomType);
    });

    it('debería manejar tipo de habitación no encontrado', async () => {
      updateRoomTypeHandler.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Tipo de habitación no encontrado' });
      });

      const response = await request(app)
        .patch('/room-types/999')
        .field('name', 'Nombre actualizado')
        .expect(404);

      expect(response.body).toEqual({ error: 'Tipo de habitación no encontrado' });
    });
  });

  describe('DELETE /:id', () => {
    it('debería eliminar un tipo de habitación', async () => {
      deleteRoomTypeHandler.mockImplementation((req, res) => {
        res.status(200).json({ message: 'Tipo de habitación eliminado exitosamente' });
      });

      const response = await request(app)
        .delete('/room-types/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Tipo de habitación eliminado exitosamente' });
      expect(deleteRoomTypeHandler).toHaveBeenCalledTimes(1);
    });

    it('debería manejar tipo de habitación no encontrado para eliminar', async () => {
      deleteRoomTypeHandler.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Tipo de habitación no encontrado' });
      });

      const response = await request(app)
        .delete('/room-types/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Tipo de habitación no encontrado' });
    });

    it('debería manejar errores al eliminar', async () => {
      deleteRoomTypeHandler.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Error interno del servidor' });
      });

      const response = await request(app)
        .delete('/room-types/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Error interno del servidor' });
    });
  });

  describe('Configuración de Multer', () => {
    it('debería validar tipos MIME de imagen', async () => {
      const pdfBuffer = Buffer.from('PDF simulado');

      const response = await request(app)
        .post('/room-types/upload/multiple')
        .attach('photos', pdfBuffer, { filename: 'document.pdf', contentType: 'application/pdf' })
        .field('name', 'Test')
        .expect(400);

      expect(response.body.error).toContain('Solo se permiten archivos de imagen');
    });

    it('debería aceptar diferentes tipos de imagen', async () => {
      createRoomTypeHandler.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, name: 'Test' });
      });

      const imageBuffer = Buffer.from('imagen simulada');

      // Test con diferentes tipos de imagen
      const imageTypes = [
        { filename: 'test.jpg', contentType: 'image/jpeg' },
        { filename: 'test.png', contentType: 'image/png' },
        { filename: 'test.gif', contentType: 'image/gif' },
        { filename: 'test.webp', contentType: 'image/webp' }
      ];

      for (const imageType of imageTypes) {
        await request(app)
          .post('/room-types/upload/multiple')
          .attach('photos', imageBuffer, imageType)
          .field('name', 'Test')
          .expect(201);
      }
    });
  });

  describe('Validación de parámetros', () => {
    it('debería validar ID numérico en rutas PATCH', async () => {
      updateRoomTypeHandler.mockImplementation((req, res) => {
        const id = req.params.id;
        if (isNaN(id)) {
          return res.status(400).json({ error: 'ID debe ser numérico' });
        }
        res.status(200).json({ id: parseInt(id) });
      });

      await request(app)
        .patch('/room-types/abc')
        .field('name', 'Test')
        .expect(400);
    });

    it('debería validar ID numérico en rutas DELETE', async () => {
      deleteRoomTypeHandler.mockImplementation((req, res) => {
        const id = req.params.id;
        if (isNaN(id)) {
          return res.status(400).json({ error: 'ID debe ser numérico' });
        }
        res.status(200).json({ message: 'Eliminado' });
      });

      await request(app)
        .delete('/room-types/abc')
        .expect(400);
    });
  });
});
