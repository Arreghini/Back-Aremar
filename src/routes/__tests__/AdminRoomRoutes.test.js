const request = require('supertest');
const express = require('express');
const AdminRoomRoutes = require('../../routes/AdminRoomRoutes');

// Mock de los handlers
jest.mock('../../handlers/room/createRoomHandler');
jest.mock('../../handlers/room/deleteRoomHandler');
jest.mock('../../handlers/room/getRoomByIdHandler');
jest.mock('../../handlers/room/roomType/getRoomTypeByRoomIdHandler');
jest.mock('../../handlers/room/getRoomHandler');
jest.mock('../../handlers/room/updateRoomHandler');

const createRoomHandler = require('../../handlers/room/createRoomHandler');
const deleteRoomHandler = require('../../handlers/room/deleteRoomHandler');
const getRoomById = require('../../handlers/room/getRoomByIdHandler');
const getRoomTypeById = require('../../handlers/room/roomType/getRoomTypeByRoomIdHandler');
const getRoomHandler = require('../../handlers/room/getRoomHandler');
const updateRoomHandler = require('../../handlers/room/updateRoomHandler');

// Configurar la aplicación de prueba
const app = express();
app.use(express.json());
app.use('/admin/rooms', AdminRoomRoutes);

describe('AdminRoomRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /admin/rooms/all', () => {
    it('debería obtener todas las habitaciones', async () => {
      const mockRooms = [
        { id: 1, name: 'Habitación 1', price: 100 },
        { id: 2, name: 'Habitación 2', price: 150 }
      ];

      getRoomHandler.getAllRooms.mockImplementation((req, res) => {
        res.status(200).json(mockRooms);
      });

      const response = await request(app).get('/admin/rooms/all').expect(200);

      expect(response.body).toEqual(mockRooms);
      expect(getRoomHandler.getAllRooms).toHaveBeenCalledTimes(1);
    });

    it('debería manejar errores al obtener todas las habitaciones', async () => {
      getRoomHandler.getAllRooms.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Error interno del servidor' });
      });

      const response = await request(app).get('/admin/rooms/all').expect(500);
      expect(response.body).toEqual({ error: 'Error interno del servidor' });
    });
  });

  describe('GET /admin/rooms/', () => {
    it('debería obtener habitaciones disponibles con parámetros de consulta', async () => {
      const mockAvailableRooms = [
        { id: 1, name: 'Habitación Disponible', price: 100, status: 'available' }
      ];

      getRoomHandler.getAvailableRooms.mockImplementation((req, res) => {
        res.status(200).json(mockAvailableRooms);
      });

      const queryParams = {
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        guests: 2
      };

      const response = await request(app).get('/admin/rooms/').query(queryParams).expect(200);

      expect(response.body).toEqual(mockAvailableRooms);
      expect(getRoomHandler.getAvailableRooms).toHaveBeenCalledTimes(1);
    });

    it('debería registrar los datos recibidos del cliente', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      getRoomHandler.getAvailableRooms.mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      const queryParams = { startDate: '2024-01-01', endDate: '2024-01-07' };

      await request(app).get('/admin/rooms/').query(queryParams).expect(200);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Datos recibidos desde el cliente para verificar disponibilidad:',
        queryParams
      );

      consoleSpy.mockRestore();
    });
  });

  describe('GET /admin/rooms/:id', () => {
    it('debería obtener una habitación específica por ID', async () => {
      const mockRoom = { id: 1, name: 'Habitación 1', price: 100 };

      getRoomById.mockImplementation((req, res) => {
        res.status(200).json(mockRoom);
      });

      const response = await request(app).get('/admin/rooms/1').expect(200);
      expect(response.body).toEqual(mockRoom);
    });

    it('debería retornar 404 si la habitación no existe', async () => {
      getRoomById.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Habitación no encontrada' });
      });

      const response = await request(app).get('/admin/rooms/999').expect(404);
      expect(response.body).toEqual({ error: 'Habitación no encontrada' });
    });
  });

  describe('GET /admin/rooms/types', () => {
    it('debería obtener tipos de habitación', async () => {
      const mockRoomTypes = [
        { id: 1, name: 'Suite' },
        { id: 2, name: 'Estándar' }
      ];

      getRoomTypeById.mockImplementation((req, res) => {
        res.status(200).json(mockRoomTypes);
      });

      const response = await request(app).get('/admin/rooms/types').expect(200);
      expect(response.body).toEqual(mockRoomTypes);
    });
  });

  describe('POST /admin/rooms/', () => {
    it('debería crear una nueva habitación con archivos', async () => {
      const mockNewRoom = { id: 1, name: 'Nueva Habitación', price: 200 };

      createRoomHandler.mockImplementation((req, res) => {
        res.status(201).json(mockNewRoom);
      });

      const response = await request(app)
        .post('/admin/rooms/')
        .field('name', 'Nueva Habitación')
        .field('price', '200')
        .field('description', 'Descripción de la habitación')
        .attach('photoRoom', Buffer.from('fake image 1'), 'image1.jpg')
        .attach('photoRoom', Buffer.from('fake image 2'), 'image2.jpg')
        .expect(201);

      expect(response.body).toEqual(mockNewRoom);
    });

    it('debería manejar errores al crear habitación', async () => {
      createRoomHandler.mockImplementation((req, res) => {
        res.status(400).json({ error: 'Datos inválidos' });
      });

      const response = await request(app).post('/admin/rooms/').field('name', '').expect(400);

      expect(response.body).toEqual({ error: 'Datos inválidos' });
    });
  });

  describe('DELETE /admin/rooms/:id', () => {
    it('debería eliminar una habitación existente', async () => {
      deleteRoomHandler.mockImplementation((req, res) => {
        res.status(200).json({ message: 'Habitación eliminada exitosamente' });
      });

      const response = await request(app).delete('/admin/rooms/1').expect(200);
      expect(response.body).toEqual({ message: 'Habitación eliminada exitosamente' });
    });

    it('debería retornar 404 si la habitación a eliminar no existe', async () => {
      deleteRoomHandler.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Habitación no encontrada' });
      });

      const response = await request(app).delete('/admin/rooms/999').expect(404);
      expect(response.body).toEqual({ error: 'Habitación no encontrada' });
    });
  });

  describe('PATCH /admin/rooms/:id', () => {
    it('debería actualizar una habitación existente con nuevas fotos', async () => {
      const mockUpdatedRoom = { id: 1, name: 'Habitación Actualizada', price: 250 };

      updateRoomHandler.mockImplementation((req, res) => {
        res.status(200).json(mockUpdatedRoom);
      });

      const response = await request(app)
        .patch('/admin/rooms/1')
        .field('name', 'Habitación Actualizada')
        .field('price', '250')
        .attach('newPhotos', Buffer.from('new fake image 1'), 'newimage1.jpg')
        .attach('newPhotos', Buffer.from('new fake image 2'), 'newimage2.jpg')
        .expect(200);

      expect(response.body).toEqual(mockUpdatedRoom);
    });

    it('debería actualizar habitación sin archivos', async () => {
      const mockUpdatedRoom = { id: 1, name: 'Habitación Actualizada', price: 250 };

      updateRoomHandler.mockImplementation((req, res) => {
        res.status(200).json(mockUpdatedRoom);
      });

      const response = await request(app)
        .patch('/admin/rooms/1')
        .send({ name: 'Habitación Actualizada', price: 250 })
        .expect(200);

      expect(response.body).toEqual(mockUpdatedRoom);
    });

    it('debería retornar 404 si la habitación a actualizar no existe', async () => {
      updateRoomHandler.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Habitación no encontrada' });
      });

      const response = await request(app)
        .patch('/admin/rooms/999')
        .send({ name: 'Nuevo nombre' })
        .expect(404);

      expect(response.body).toEqual({ error: 'Habitación no encontrada' });
    });
  });

  describe('Validación de límites de archivos', () => {
    it('debería aceptar hasta 5 archivos en POST', async () => {
      createRoomHandler.mockImplementation((req, res) => {
        expect(req.files).toHaveLength(5);
        res.status(201).json({ message: 'Habitación creada' });
      });

      await request(app)
        .post('/admin/rooms/')
        .field('name', 'Test Room')
        .attach('photoRoom', Buffer.from('fake image 1'), 'image1.jpg')
        .attach('photoRoom', Buffer.from('fake image 2'), 'image2.jpg')
        .attach('photoRoom', Buffer.from('fake image 3'), 'image3.jpg')
        .attach('photoRoom', Buffer.from('fake image 4'), 'image4.jpg')
        .attach('photoRoom', Buffer.from('fake image 5'), 'image5.jpg')
        .expect(201);

      expect(createRoomHandler).toHaveBeenCalled();
    });

    it('debería rechazar más de 5 archivos (comportamiento esperado)', async () => {
      // No mockear el handler para este test, dejar que multer maneje el error
    
      const response = await request(app)
        .post('/admin/rooms/')
        .field('name', 'Test Room')
        .attach('photoRoom', Buffer.from('fake image 1'), 'image1.jpg')
        .attach('photoRoom', Buffer.from('fake image 2'), 'image2.jpg')
        .attach('photoRoom', Buffer.from('fake image 3'), 'image3.jpg')
        .attach('photoRoom', Buffer.from('fake image 4'), 'image4.jpg')
        .attach('photoRoom', Buffer.from('fake image 5'), 'image5.jpg')
        .attach('photoRoom', Buffer.from('fake image 6'), 'image6.jpg');

      // Multer puede devolver 400 o 500 dependiendo del entorno
      expect([400, 500]).toContain(response.status);
    
      // Verificar que es un error relacionado con archivos
      if (response.status === 400) {
        expect(response.body).toHaveProperty('error');
      } else if (response.status === 500) {
        // En caso de error 500, verificar que el createRoomHandler no fue llamado
        expect(createRoomHandler).not.toHaveBeenCalled();
      }
    });
  });
});
