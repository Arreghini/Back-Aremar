const request = require('supertest');
const express = require('express');
const AdminRoomTypeRoutes = require('../AdminRoomTypeRoutes');

// Mock de los handlers
jest.mock('../../handlers/room/roomType/getRoomTypeHandler');
jest.mock('../../handlers/room/roomType/createRoomTypeHandler');
jest.mock('../../handlers/room/roomType/updateRoomTypeHandler');
jest.mock('../../handlers/room/roomType/deleteRoomTypeHandler');

const getRoomTypeHandler = require('../../handlers/room/roomType/getRoomTypeHandler');
const createRoomTypeHandler = require('../../handlers/room/roomType/createRoomTypeHandler');
const updateRoomTypeHandler = require('../../handlers/room/roomType/updateRoomTypeHandler');
const deleteRoomTypeHandler = require('../../handlers/room/roomType/deleteRoomTypeHandler');

// Configurar la aplicación de prueba
const app = express();
app.use(express.json());
app.use('/api/rooms/admin/roomType', AdminRoomTypeRoutes);

describe('AdminRoomTypeRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
        .get('/api/rooms/admin/roomType')
        .expect(200);

      expect(response.body).toEqual(mockRoomTypes);
      expect(getRoomTypeHandler).toHaveBeenCalledTimes(1);
    });

    it('debería manejar errores al obtener tipos de habitación', async () => {
      getRoomTypeHandler.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Error interno del servidor' });
      });

      const response = await request(app)
        .get('/api/rooms/admin/roomType')
        .expect(500);

      expect(response.body).toEqual({ error: 'Error interno del servidor' });
    });
  });

  describe('POST /', () => {
    it('debería crear un nuevo tipo de habitación sin fotos', async () => {
      const newRoomType = {
        name: 'Deluxe',
        description: 'Habitación premium',
        price: 150
      };

      const createdRoomType = { id: 3, ...newRoomType };

      createRoomTypeHandler.mockImplementation((req, res) => {
        res.status(201).json(createdRoomType);
      });

      const response = await request(app)
        .post('/api/rooms/admin/roomType')
        .send(newRoomType)
        .expect(201);

      expect(response.body).toEqual(createdRoomType);
      expect(createRoomTypeHandler).toHaveBeenCalledTimes(1);
    });

    it('debería crear un nuevo tipo de habitación con fotos', async () => {
      const newRoomType = {
        name: 'Deluxe',
        description: 'Habitación premium',
        price: 150
      };

      const createdRoomType = { id: 3, ...newRoomType, photos: ['photo1.jpg', 'photo2.jpg'] };

      createRoomTypeHandler.mockImplementation((req, res) => {
        res.status(201).json(createdRoomType);
      });

      const response = await request(app)
        .post('/api/rooms/admin/roomType')
        .field('name', newRoomType.name)
        .field('description', newRoomType.description)
        .field('price', newRoomType.price)
        .attach('photos', Buffer.from('fake image 1'), 'photo1.jpg')
        .attach('photos', Buffer.from('fake image 2'), 'photo2.jpg')
        .expect(201);

      expect(response.body).toEqual(createdRoomType);
      expect(createRoomTypeHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /upload', () => {
    it('debería crear un tipo de habitación usando la ruta /upload', async () => {
      const newRoomType = {
        name: 'Executive',
        description: 'Habitación ejecutiva',
        price: 200
      };

      const createdRoomType = { id: 4, ...newRoomType, photos: ['exec1.jpg'] };

      createRoomTypeHandler.mockImplementation((req, res) => {
        res.status(201).json(createdRoomType);
      });

      const response = await request(app)
        .post('/api/rooms/admin/roomType/upload')
        .field('name', newRoomType.name)
        .field('description', newRoomType.description)
        .field('price', newRoomType.price)
        .attach('photos', Buffer.from('fake executive image'), 'exec1.jpg')
        .expect(201);

      expect(response.body).toEqual(createdRoomType);
      expect(createRoomTypeHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('PATCH /:id', () => {
    it('debería actualizar un tipo de habitación existente', async () => {
      const roomTypeId = 1;
      const updateData = {
        name: 'Suite Actualizada',
        description: 'Descripción actualizada'
      };

      const updatedRoomType = { id: roomTypeId, ...updateData, price: 180 };

      updateRoomTypeHandler.mockImplementation((req, res) => {
        res.status(200).json(updatedRoomType);
      });

      const response = await request(app)
        .patch(`/api/rooms/admin/roomType/${roomTypeId}`)
        .field('name', updateData.name)
        .field('description', updateData.description)
        .expect(200);

      expect(response.body).toEqual(updatedRoomType);
      expect(updateRoomTypeHandler).toHaveBeenCalledTimes(1);
    });

    it('debería actualizar un tipo de habitación con nuevas fotos', async () => {
      const roomTypeId = 1;
      const updateData = {
        name: 'Suite con Fotos Nuevas'
      };

      const updatedRoomType = { 
        id: roomTypeId, 
        ...updateData, 
        photos: ['new1.jpg', 'new2.jpg'] 
      };

      updateRoomTypeHandler.mockImplementation((req, res) => {
        res.status(200).json(updatedRoomType);
      });

      const response = await request(app)
        .patch(`/api/rooms/admin/roomType/${roomTypeId}`)
        .field('name', updateData.name)
        .attach('photos', Buffer.from('new image 1'), 'new1.jpg')
        .attach('photos', Buffer.from('new image 2'), 'new2.jpg')
        .expect(200);

      expect(response.body).toEqual(updatedRoomType);
      expect(updateRoomTypeHandler).toHaveBeenCalledTimes(1);
    });

    it('debería manejar error cuando el tipo de habitación no existe', async () => {
      const roomTypeId = 999;

      updateRoomTypeHandler.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Tipo de habitación no encontrado' });
      });

      const response = await request(app)
        .patch(`/api/rooms/admin/roomType/${roomTypeId}`)
        .field('name', 'Nombre actualizado')
        .expect(404);

      expect(response.body).toEqual({ error: 'Tipo de habitación no encontrado' });
    });
  });

  describe('DELETE /:id', () => {
    it('debería eliminar un tipo de habitación existente', async () => {
      const roomTypeId = 1;

      deleteRoomTypeHandler.mockImplementation((req, res) => {
        res.status(200).json({ message: 'Tipo de habitación eliminado correctamente' });
      });

      const response = await request(app)
        .delete(`/api/rooms/admin/roomType/${roomTypeId}`)
        .expect(200);

      expect(response.body).toEqual({ message: 'Tipo de habitación eliminado correctamente' });
      expect(deleteRoomTypeHandler).toHaveBeenCalledTimes(1);
    });

    it('debería manejar error cuando el tipo de habitación a eliminar no existe', async () => {
      const roomTypeId = 999;

      deleteRoomTypeHandler.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Tipo de habitación no encontrado' });
      });

      const response = await request(app)
        .delete(`/api/rooms/admin/roomType/${roomTypeId}`)
        .expect(404);

      expect(response.body).toEqual({ error: 'Tipo de habitación no encontrado' });
    });
  });

  describe('Validación de archivos', () => {
    it('debería manejar múltiples archivos (máximo 10)', async () => {
      createRoomTypeHandler.mockImplementation((req, res) => {
        // Simular que multer procesó los archivos
        expect(req.files).toBeDefined();
        expect(req.files.length).toBeLessThanOrEqual(10);
        res.status(201).json({ message: 'Archivos procesados correctamente' });
      });

      const request_builder = request(app)
        .post('/api/rooms/admin/roomType')
        .field('name', 'Test Room');

      // Agregar 5 archivos de prueba
      for (let i = 1; i <= 5; i++) {
        request_builder.attach('photos', Buffer.from(`fake image ${i}`), `photo${i}.jpg`);
      }

      const response = await request_builder.expect(201);

      expect(response.body).toEqual({ message: 'Archivos procesados correctamente' });
    });
  });
});
