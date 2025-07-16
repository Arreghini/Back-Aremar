const request = require('supertest');
const express = require('express');
const AdminRoomDetailsRoutes = require('../../routes/AdminRoomDetailsRoutes');

// Mock de los handlers
jest.mock('../../handlers/room/roomDetail/getRoomDetailHandler');
jest.mock('../../handlers/room/roomDetail/createRoomDetailHandler');
jest.mock('../../handlers/room/roomDetail/updateRoomDetailHandler');
jest.mock('../../handlers/room/roomDetail/deleteRoomDetailHandler');

const getRoomDetailHandler = require('../../handlers/room/roomDetail/getRoomDetailHandler');
const createRoomDetailHandler = require('../../handlers/room/roomDetail/createRoomDetailHandler');
const updateRoomDetailHandler = require('../../handlers/room/roomDetail/updateRoomDetailHandler');
const deleteRoomDetailHandler = require('../../handlers/room/roomDetail/deleteRoomDetailHandler');

// Configuración de la aplicación de prueba
const app = express();
app.use(express.json());
app.use('/admin/room-details', AdminRoomDetailsRoutes);

describe('AdminRoomDetailsRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('debería llamar al handler getRoomDetailHandler', async () => {
      // Arrange
      const mockResponse = { success: true, data: [] };
      getRoomDetailHandler.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      // Act
      const response = await request(app)
        .get('/admin/room-details')
        .expect(200);

      // Assert
      expect(getRoomDetailHandler).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(mockResponse);
    });

    it('debería manejar errores del handler getRoomDetailHandler', async () => {
      // Arrange
      getRoomDetailHandler.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Error interno del servidor' });
      });

      // Act
      const response = await request(app)
        .get('/admin/room-details')
        .expect(500);

      // Assert
      expect(response.body).toEqual({ error: 'Error interno del servidor' });
    });
  });

  describe('POST /', () => {
    it('debería crear un nuevo detalle de habitación', async () => {
      // Arrange
      const newRoomDetail = {
        roomId: 1,
        description: 'Habitación con vista al mar',
        amenities: ['WiFi', 'TV', 'Aire acondicionado']
      };
      const mockResponse = { success: true, data: { id: 1, ...newRoomDetail } };
      
      createRoomDetailHandler.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      // Act
      const response = await request(app)
        .post('/admin/room-details')
        .send(newRoomDetail)
        .expect(201);

      // Assert
      expect(createRoomDetailHandler).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(mockResponse);
    });

    it('debería manejar errores de validación en POST', async () => {
      // Arrange
      createRoomDetailHandler.mockImplementation((req, res) => {
        res.status(400).json({ error: 'Datos de entrada inválidos' });
      });

      // Act
      const response = await request(app)
        .post('/admin/room-details')
        .send({})
        .expect(400);

      // Assert
      expect(response.body).toEqual({ error: 'Datos de entrada inválidos' });
    });
  });

  describe('PATCH /:id', () => {
    it('debería actualizar un detalle de habitación existente', async () => {
      // Arrange
      const roomDetailId = '1';
      const updateData = {
        description: 'Habitación renovada con vista al mar'
      };
      const mockResponse = { 
        success: true, 
        data: { id: 1, ...updateData } 
      };
      
      updateRoomDetailHandler.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      // Act
      const response = await request(app)
        .patch(`/admin/room-details/${roomDetailId}`)
        .send(updateData)
        .expect(200);

      // Assert
      expect(updateRoomDetailHandler).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(mockResponse);
    });

    it('debería manejar el caso cuando no se encuentra el detalle de habitación', async () => {
      // Arrange
      updateRoomDetailHandler.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Detalle de habitación no encontrado' });
      });

      // Act
      const response = await request(app)
        .patch('/admin/room-details/999')
        .send({ description: 'Nueva descripción' })
        .expect(404);

      // Assert
      expect(response.body).toEqual({ error: 'Detalle de habitación no encontrado' });
    });
  });

  describe('DELETE /:id', () => {
    it('debería eliminar un detalle de habitación existente', async () => {
      // Arrange
      const roomDetailId = '1';
      const mockResponse = { 
        success: true, 
        message: 'Detalle de habitación eliminado correctamente' 
      };
      
      deleteRoomDetailHandler.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      // Act
      const response = await request(app)
        .delete(`/admin/room-details/${roomDetailId}`)
        .expect(200);

      // Assert
      expect(deleteRoomDetailHandler).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(mockResponse);
    });

    it('debería manejar el caso cuando no se encuentra el detalle de habitación para eliminar', async () => {
      // Arrange
      deleteRoomDetailHandler.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Detalle de habitación no encontrado' });
      });

      // Act
      const response = await request(app)
        .delete('/admin/room-details/999')
        .expect(404);

      // Assert
      expect(response.body).toEqual({ error: 'Detalle de habitación no encontrado' });
    });
  });

  describe('Rutas no válidas', () => {
    it('debería devolver 404 para métodos HTTP no soportados', async () => {
      // Act & Assert
      await request(app)
        .put('/admin/room-details')
        .expect(404);
    });

    it('debería devolver 404 para rutas que no existen', async () => {
      // Act & Assert
      await request(app)
        .get('/admin/room-details/invalid/route')
        .expect(404);
    });
  });
});
