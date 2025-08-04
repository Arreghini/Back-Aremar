const request = require('supertest');
const express = require('express');
const ReservationRoutes = require('../ReservationRoutes');

// Mock de los handlers
jest.mock('../../handlers/reservation/createReservationHandler');
jest.mock('../../handlers/reservation/getReservationHandler');
jest.mock('../../handlers/reservation/updateReservationHandler');
jest.mock('../../handlers/reservation/deleteReservationByIdHandler');
jest.mock('../../handlers/reservation/createPreferenceHandler');
jest.mock('../../services/middlewares');

const createReservationHandler = require('../../handlers/reservation/createReservationHandler');
const getReservationHandler = require('../../handlers/reservation/getReservationHandler');
const updateReservationHandler = require('../../handlers/reservation/updateReservationHandler');
const deleteReservationByIdHandler = require('../../handlers/reservation/deleteReservationByIdHandler');
jest.mock('../../services/middlewares', () => ({
  jwtCheck: jest.fn((req, res, next) => next())
}));


const { jwtCheck } = require('../../services/middlewares');
describe('ReservationRoutes', () => {
  let app;

  beforeEach(() => {
    // Configurar la aplicación Express para testing
    app = express();
    app.use(express.json());
    app.use('/reservations', ReservationRoutes);

    // Mock del middleware de autenticación por defecto
    jwtCheck.mockImplementation((req, res, next) => {
      req.auth = {
        payload: {
          sub: 'google-oauth2|123456789',
          email: 'test@example.com',
          name: 'Usuario Test'
        }
      };
      next();
    });

    // Limpiar todos los mocks
    jest.clearAllMocks();
  });

  describe('POST /', () => {
    it('debería crear una nueva reserva exitosamente', async () => {
      const mockReservation = {
        id: 1,
        roomId: 1,
        checkIn: '2024-01-15',
        checkOut: '2024-01-20',
        totalPrice: 500,
        numberOfGuests: 2,
        status: 'confirmed',
        userId: 'google-oauth2|123456789'
      };

      createReservationHandler.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: mockReservation,
          message: 'Reserva creada exitosamente'
        });
      });

      const reservationData = {
        roomId: 1,
        checkIn: '2024-01-15',
        checkOut: '2024-01-20',
        numberOfGuests: 2
      };

      const response = await request(app)
        .post('/reservations')
        .send(reservationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockReservation);
      expect(response.body.message).toBe('Reserva creada exitosamente');
      expect(createReservationHandler).toHaveBeenCalledTimes(1);
    });

    it('debería manejar errores de validación en la creación', async () => {
      createReservationHandler.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Datos de reserva inválidos',
          errors: ['checkIn es requerido', 'checkOut es requerido']
        });
      });

      const invalidData = {
        roomId: 1,
        numberOfGuests: 2
        // Faltan checkIn y checkOut
      };

      const response = await request(app)
        .post('/reservations')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Datos de reserva inválidos');
      expect(response.body.errors).toContain('checkIn es requerido');
    });

    it('debería manejar conflictos de disponibilidad', async () => {
      createReservationHandler.mockImplementation((req, res) => {
        res.status(409).json({
          success: false,
          message: 'La habitación no está disponible en las fechas seleccionadas'
        });
      });

      const conflictData = {
        roomId: 1,
        checkIn: '2024-01-15',
        checkOut: '2024-01-20',
        numberOfGuests: 2
      };

      const response = await request(app)
        .post('/reservations')
        .send(conflictData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('La habitación no está disponible en las fechas seleccionadas');
    });

    it('debería fallar si no se proporciona autenticación', async () => {
      jwtCheck.mockImplementation((req, res, next) => {
        res.status(401).json({ 
          error: 'Token no válido',
          message: 'Se requiere autenticación'
        });
      });

      const reservationData = {
        roomId: 1,
        checkIn: '2024-01-15',
        checkOut: '2024-01-20',
        numberOfGuests: 2
      };

      const response = await request(app)
        .post('/reservations')
        .send(reservationData)
        .expect(401);

      expect(response.body.error).toBe('Token no válido');
    });

    it('debería manejar errores internos del servidor', async () => {
      createReservationHandler.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      });

      const reservationData = {
        roomId: 1,
        checkIn: '2024-01-15',
        checkOut: '2024-01-20',
        numberOfGuests: 2
      };

      const response = await request(app)
        .post('/reservations')
        .send(reservationData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error interno del servidor');
    });
  });

  describe('GET /', () => {
    it('debería obtener todas las reservas exitosamente', async () => {
      const mockReservations = [
        {
          id: 1,
          roomId: 1,
          checkIn: '2024-01-15',
          checkOut: '2024-01-20',
          totalPrice: 500,
          status: 'confirmed',
          numberOfGuests: 2,
          user: { id: 'google-oauth2|123456789', name: 'Usuario 1' }
        },
        {
          id: 2,
          roomId: 2,
          checkIn: '2024-02-01',
          checkOut: '2024-02-05',
          totalPrice: 300,
          status: 'pending',
          numberOfGuests: 1,
          user: { id: 'google-oauth2|987654321', name: 'Usuario 2' }
        }
      ];

      getReservationHandler.getAllReservationHandler.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockReservations,
          total: mockReservations.length,
          page: 1,
          limit: 10
        });
      });

      const response = await request(app)
        .get('/reservations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockReservations);
      expect(response.body.total).toBe(2);
      expect(getReservationHandler.getAllReservationHandler).toHaveBeenCalledTimes(1);
    });

    it('debería manejar lista vacía de reservas', async () => {
      getReservationHandler.getAllReservationHandler.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [],
          total: 0,
          message: 'No se encontraron reservas'
        });
      });

      const response = await request(app)
        .get('/reservations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('debería manejar parámetros de consulta', async () => {
      getReservationHandler.getAllReservationHandler.mockImplementation((req, res) => {
        expect(req.query.page).toBe('2');
        expect(req.query.limit).toBe('5');
        expect(req.query.status).toBe('confirmed');
        
        res.status(200).json({
          success: true,
          data: [],
          page: 2,
          limit: 5
        });
      });

      await request(app)
        .get('/reservations?page=2&limit=5&status=confirmed')
        .expect(200);
    });

    it('debería manejar errores al obtener reservas', async () => {
      getReservationHandler.getAllReservationHandler.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error al obtener las reservas'
        });
      });

      const response = await request(app)
        .get('/reservations')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /user/:userId', () => {
    it('debería obtener las reservas de un usuario específico', async () => {
      const userId = 'google-oauth2|123456789';
      const mockUserReservations = [
        {
          id: 1,
          roomId: 1,
          checkIn: '2024-01-15',
          checkOut: '2024-01-20',
          totalPrice: 500,
          status: 'confirmed',
          numberOfGuests: 2,
          room: {
            id: 1,
            roomType: { name: 'Suite' }
          }
        }
      ];

      getReservationHandler.getReservationByUserIdHandler.mockImplementation((req, res) => {
        expect(req.params.userId).toBe(userId);
        res.status(200).json({
          success: true,
          data: mockUserReservations,
          userId: userId,
          formattedUserId: `google-oauth2|${userId}`
        });
      });

      const response = await request(app)
        .get(`/reservations/user/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUserReservations);
      expect(response.body.userId).toBe(userId);
      expect(getReservationHandler.getReservationByUserIdHandler).toHaveBeenCalledTimes(1);
    });

    it('debería manejar userId sin formato google-oauth2', async () => {
      const userId = '123456789';
      
      getReservationHandler.getReservationByUserIdHandler.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [],
          userId: userId,
          formattedUserId: `google-oauth2|${userId}`
        });
      });

      const response = await request(app)
        .get(`/reservations/user/${userId}`)
        .expect(200);

      expect(response.body.formattedUserId).toBe(`google-oauth2|${userId}`);
    });

    it('debería manejar el error cuando no se encuentra el usuario', async () => {
      const userId = 'nonexistent-user';

      getReservationHandler.getReservationByUserIdHandler.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      });

      const response = await request(app)
        .get(`/reservations/user/${userId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Usuario no encontrado');
    });

    it('debería manejar errores internos al buscar por usuario', async () => {
      const userId = 'google-oauth2|123456789';

      getReservationHandler.getReservationByUserIdHandler.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error al obtener las reservas',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .get(`/reservations/user/${userId}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Database connection failed');
    });
  });

  describe('GET /:reservationId', () => {
        it('debería obtener una reserva específica por ID', async () => {
      const reservationId = '1';
      const mockReservation = {
        id: 1,
        roomId: 1,
        checkIn: '2024-01-15',
        checkOut: '2024-01-20',
        totalPrice: 500,
        status: 'confirmed',
        numberOfGuests: 2,
        amountPaid: 250,
        room: {
          id: 1,
          status: 'occupied',
          roomType: { name: 'Suite Deluxe' }
        },
        user: {
          id: 'google-oauth2|123456789',
          name: 'Juan Pérez',
          email: 'juan@example.com'
        }
      };

      getReservationHandler.getReservationByIdHandler.mockImplementation((req, res) => {
        expect(req.params.reservationId).toBe(reservationId);
        res.status(200).json(mockReservation);
      });

      const response = await request(app)
        .get(`/reservations/${reservationId}`)
        .expect(200);

      expect(response.body).toEqual(mockReservation);
      expect(response.body.room.roomType.name).toBe('Suite Deluxe');
      expect(getReservationHandler.getReservationByIdHandler).toHaveBeenCalledTimes(1);
    });
  });
}); 