const request = require('supertest');
const express = require('express');

// Mock de los modelos antes de importar las rutas
jest.mock('../../models', () => ({
  Room: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

// Mock de todos los handlers
jest.mock('../../handlers/room/createRoomHandler', () => jest.fn());
jest.mock('../../handlers/room/deleteRoomHandler', () => jest.fn());
jest.mock('../../handlers/room/getRoomByIdHandler', () => jest.fn());
jest.mock('../../handlers/room/getRoomByQueryHandler', () => jest.fn());
jest.mock('../../handlers/room/roomType/getRoomTypeHandler', () => jest.fn());
jest.mock('../../handlers/room/getRoomHandler', () => ({
  getAllRooms: jest.fn(),
  getAvailableRooms: jest.fn()
}));
jest.mock('../../handlers/room/updateRoomHandler', () => jest.fn());
jest.mock('../../handlers/room/roomType/getRoomTypeByRoomIdHandler', () => jest.fn());

const RoomRoutes = require('../RoomRoutes');

// Importar los handlers mockeados
const createRoomHandler = require('../../handlers/room/createRoomHandler');
const deleteRoomHandler = require('../../handlers/room/deleteRoomHandler');
const getRoomById = require('../../handlers/room/getRoomByIdHandler');
const getRoomByQuery = require('../../handlers/room/getRoomByQueryHandler');
const getRoomsTypeHandler = require('../../handlers/room/roomType/getRoomTypeHandler');
const getRoomHandler = require('../../handlers/room/getRoomHandler');
const updateRoomHandler = require('../../handlers/room/updateRoomHandler');
const getRoomTypeByRoomIdHandler = require('../../handlers/room/roomType/getRoomTypeByRoomIdHandler');

// Configurar la aplicación de prueba
const app = express();
app.use(express.json());
app.use('/rooms', RoomRoutes);

describe('RoomRoutes', () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log para evitar spam en las pruebas
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    if (consoleSpy) {
      consoleSpy.mockRestore();
    }
  });

  describe('GET /rooms/all', () => {
    it('debería obtener todas las habitaciones', async () => {
      const mockRooms = [
        { id: 1, name: 'Habitación 1', price: 100 },
        { id: 2, name: 'Habitación 2', price: 150 }
      ];

      getRoomHandler.getAllRooms.mockImplementation((req, res) => {
        res.status(200).json(mockRooms);
      });

      const response = await request(app)
        .get('/rooms/all')
        .expect(200);

      expect(response.body).toEqual(mockRooms);
      expect(getRoomHandler.getAllRooms).toHaveBeenCalledTimes(1);
    }, 10000);
  });

  describe('GET /rooms/available', () => {
    it('debería obtener habitaciones disponibles con query params', async () => {
      const mockAvailableRooms = [
        { id: 1, name: 'Habitación Disponible', price: 100, available: true }
      ];

      getRoomHandler.getAvailableRooms.mockImplementation((req, res) => {
        res.status(200).json(mockAvailableRooms);
      });

      const queryParams = {
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        beds: 2
      };

      const response = await request(app)
        .get('/rooms/available')
        .query(queryParams)
        .expect(200);

      expect(response.body).toEqual(mockAvailableRooms);
      expect(getRoomHandler.getAvailableRooms).toHaveBeenCalledTimes(1);
    }, 10000);

    it('debería registrar los query params en consola', async () => {
      // Restaurar console.log temporalmente para esta prueba
      consoleSpy.mockRestore();
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      getRoomHandler.getAvailableRooms.mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      const queryParams = { startDate: '2024-01-01', endDate: '2024-01-07' };

      await request(app)
        .get('/rooms/available')
        .query(queryParams)
        .expect(200);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Datos recibidos desde el cliente para verificar disponibilidad:',
        expect.objectContaining({
          startDate: '2024-01-01',
          endDate: '2024-01-07'
        })
      );
    }, 10000);
  });

  describe('GET /rooms/roomType', () => {
    it('debería obtener tipos de habitaciones', async () => {
      const mockRoomTypes = [
        { id: 1, name: 'Suite', description: 'Habitación de lujo' },
        { id: 2, name: 'Estándar', description: 'Habitación básica' }
      ];

      getRoomsTypeHandler.mockImplementation((req, res) => {
        res.status(200).json(mockRoomTypes);
      });

      const response = await request(app)
        .get('/rooms/roomType')
        .expect(200);

      expect(response.body).toEqual(mockRoomTypes);
      expect(getRoomsTypeHandler).toHaveBeenCalledTimes(1);
    }, 10000);
  });

  describe('GET /rooms/:roomId (getRoomTypeByRoomIdHandler)', () => {
    it('debería obtener tipo de habitación por ID de habitación', async () => {
      const roomId = '123';
      const mockRoomType = { id: 1, name: 'Suite', roomId: 123 };

      getRoomTypeByRoomIdHandler.mockImplementation((req, res) => {
        res.status(200).json(mockRoomType);
      });

      const response = await request(app)
        .get(`/rooms/${roomId}`)
        .expect(200);

      expect(response.body).toEqual(mockRoomType);
      expect(getRoomTypeByRoomIdHandler).toHaveBeenCalledTimes(1);
    }, 10000);
  });

  describe('GET /rooms/ (getRoomByQuery)', () => {
    it('debería obtener habitaciones por query con filtros', async () => {
      const mockFilteredRooms = [
        { id: 1, name: 'Habitación Filtrada', price: 100, beds: 2 }
      ];

      getRoomByQuery.mockImplementation((req, res) => {
        res.status(200).json(mockFilteredRooms);
      });

      const queryParams = {
        price: 100,
        beds: 2,
        search: 'vista al mar'
      };

      const response = await request(app)
        .get('/rooms/')
        .query(queryParams)
        .expect(200);

      expect(response.body).toEqual(mockFilteredRooms);
      expect(getRoomByQuery).toHaveBeenCalledTimes(1);
    }, 10000);
  });

  describe('POST /rooms/', () => {
    it('debería crear una nueva habitación', async () => {
      const newRoom = {
        name: 'Nueva Habitación',
        price: 200,
        beds: 3,
        description: 'Habitación con vista al mar'
      };

      const createdRoom = { id: 1, ...newRoom };

      createRoomHandler.mockImplementation((req, res) => {
        res.status(201).json(createdRoom);
      });

      const response = await request(app)
        .post('/rooms/')
        .send(newRoom)
        .expect(201);

      expect(response.body).toEqual(createdRoom);
      expect(createRoomHandler).toHaveBeenCalledTimes(1);
    }, 10000);

    it('debería registrar los datos del body en consola', async () => {
      // Restaurar console.log temporalmente para esta prueba
      consoleSpy.mockRestore();
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      createRoomHandler.mockImplementation((req, res) => {
        res.status(201).json({ id: 1 });
      });

      const roomData = { name: 'Test Room', price: 100 };

      await request(app)
        .post('/rooms/')
        .send(roomData)
        .expect(201);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Datos recibidos desde el dashboard:',
        expect.objectContaining(roomData)
      );
    }, 10000);
  });

  describe('DELETE /rooms/:id', () => {
    it('debería eliminar una habitación por ID', async () => {
      const roomId = '123';

      deleteRoomHandler.mockImplementation((req, res) => {
        res.status(200).json({ message: 'Habitación eliminada correctamente' });
      });

      const response = await request(app)
        .delete(`/rooms/${roomId}`)
        .expect(200);

      expect(response.body.message).toBe('Habitación eliminada correctamente');
      expect(deleteRoomHandler).toHaveBeenCalledTimes(1);
    }, 10000);

    it('debería registrar datos de la solicitud DELETE en consola', async () => {
      // Restaurar console.log temporalmente para esta prueba
      consoleSpy.mockRestore();
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const roomId = '123';

      deleteRoomHandler.mockImplementation((req, res) => {
        res.status(200).json({ message: 'Eliminado' });
      });

      await request(app)
        .delete(`/rooms/${roomId}`)
        .expect(200);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Datos recibidos en la solicitud DELETE:',
        expect.objectContaining({
          roomId: roomId,
          headers: expect.any(Object)
        })
      );
    }, 10000);
  });

  describe('PATCH /rooms/:id', () => {
    it('debería actualizar una habitación por ID', async () => {
      const roomId = '123';
      const updateData = {
        name: 'Habitación Actualizada',
        price: 250
      };

      const updatedRoom = { id: parseInt(roomId), ...updateData };

      updateRoomHandler.mockImplementation((req, res) => {
        res.status(200).json(updatedRoom);
      });

      const response = await request(app)
        .patch(`/rooms/${roomId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedRoom);
      expect(updateRoomHandler).toHaveBeenCalledTimes(1);
    }, 10000);
  });

  describe('Manejo de errores', () => {
    it('debería manejar errores del servidor en GET /rooms/all', async () => {
      getRoomHandler.getAllRooms.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Error interno del servidor' });
      });

      const response = await request(app)
        .get('/rooms/all')
        .expect(500);

      expect(response.body.error).toBe('Error interno del servidor');
    }, 10000);

    it('debería manejar errores en la creación de habitaciones', async () => {
      createRoomHandler.mockImplementation((req, res) => {
        res.status(400).json({ error: 'Datos inválidos' });
      });

      const invalidData = { name: '' }; // Datos inválidos

      const response = await request(app)
        .post('/rooms/')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Datos inválidos');
    }, 10000);
  });

  describe('Validación de parámetros', () => {
    it('debería manejar parámetros de query vacíos en /rooms/available', async () => {
      getRoomHandler.getAvailableRooms.mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      await request(app)
        .get('/rooms/available')
        .expect(200);

      expect(getRoomHandler.getAvailableRooms).toHaveBeenCalledTimes(1);
    }, 10000);

    it('debería manejar ID de habitación no numérico', async () => {
      getRoomTypeByRoomIdHandler.mockImplementation((req, res) => {
        res.status(400).json({ error: 'ID de habitación inválido' });
      });

      await request(app)
        .get('/rooms/invalid-id')
        .expect(400);
    }, 10000);
  });
});
