const request = require('supertest');
const express = require('express');
const AdminReservationRoutes = require('../AdminReservationRoutes');

// Mock de todos los handlers
jest.mock('../../handlers/reservation/createReservationHandler');
jest.mock('../../handlers/reservation/getReservationHandler');
jest.mock('../../handlers/reservation/updateReservationHandler');
jest.mock('../../handlers/reservation/deleteReservationByIdHandler');
jest.mock('../../handlers/reservation/cancelReservationByAdminHandler');
jest.mock('../../handlers/reservation/cancelReservationWithRefundHandler');
jest.mock('../../handlers/reservation/confirmedReservationByAdminHandler');
jest.mock('../../handlers/reservation/createPreferenceHandler');

const createReservationHandler = require('../../handlers/reservation/createReservationHandler');
const getReservationHandler = require('../../handlers/reservation/getReservationHandler');
const updateReservationHandler = require('../../handlers/reservation/updateReservationHandler');
const deleteReservationByIdHandler = require('../../handlers/reservation/deleteReservationByIdHandler');
const cancelReservationByAdminHandler = require('../../handlers/reservation/cancelReservationByAdminHandler');
const cancelReservationWithRefundHandler = require('../../handlers/reservation/cancelReservationWithRefundHandler');
const confirmedReservationByAdminHandler = require('../../handlers/reservation/confirmedReservationByAdminHandler');

describe('AdminReservationRoutes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/admin/reservations', AdminReservationRoutes);
    jest.clearAllMocks();
  });

  describe('POST /', () => {
    it('debería crear una reserva como administrador', async () => {
      const mockReservation = {
        id: 1,
        roomId: 'P2D3',
        userId: 'google-oauth2|123',
        checkIn: '2024-01-15',
        checkOut: '2024-01-20',
        totalPrice: 500
      };

      createReservationHandler.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: mockReservation
        });
      });

      const reservationData = {
        roomId: 'P2D3',
        userId: 'google-oauth2|123',
        checkIn: '2024-01-15',
        checkOut: '2024-01-20',
        numberOfGuests: 2
      };

      const response = await request(app)
        .post('/admin/reservations')
        .send(reservationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockReservation);
      expect(createReservationHandler).toHaveBeenCalledTimes(1);
    });

    it('debería manejar errores al crear una reserva', async () => {
      createReservationHandler.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Datos de reserva inválidos'
        });
      });

      const response = await request(app)
        .post('/admin/reservations')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Datos de reserva inválidos');
    });
  });

  describe('GET /', () => {
    it('debería obtener todas las reservas como administrador', async () => {
      const mockReservations = [
        {
          id: 1,
          roomId: 'P2D3',
          userId: 'google-oauth2|123',
          status: 'confirmed'
        },
        {
          id: 2,
          roomId: 'P1D2',
          userId: 'google-oauth2|456',
          status: 'pending'
        }
      ];

      getReservationHandler.getAllReservationHandler.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockReservations
        });
      });

      const response = await request(app)
        .get('/admin/reservations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockReservations);
      expect(getReservationHandler.getAllReservationHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /:reservationId', () => {
    it('debería obtener una reserva específica por ID', async () => {
      const mockReservation = {
        id: 1,
        roomId: 'P2D3',
        userId: 'google-oauth2|123',
        checkIn: '2024-01-15',
        checkOut: '2024-01-20',
        status: 'confirmed'
      };

      getReservationHandler.getReservationByIdHandler.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockReservation
        });
      });

      const response = await request(app)
        .get('/admin/reservations/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockReservation);
      expect(getReservationHandler.getReservationByIdHandler).toHaveBeenCalledTimes(1);
    });

    it('debería retornar 404 si la reserva no existe', async () => {
      getReservationHandler.getReservationByIdHandler.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      });

      const response = await request(app)
        .get('/admin/reservations/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Reserva no encontrada');
    });
  });

  describe('PATCH /:reservationId/cancel-with-refund', () => {
    it('debería cancelar una reserva con reembolso', async () => {
      cancelReservationWithRefundHandler.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Reserva cancelada con reembolso exitosamente'
        });
      });

      const response = await request(app)
        .patch('/admin/reservations/1/cancel-with-refund')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Reserva cancelada con reembolso exitosamente');
      expect(cancelReservationWithRefundHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('PATCH /:reservationId/cancel', () => {
    it('debería cancelar una reserva sin reembolso', async () => {
      cancelReservationByAdminHandler.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Reserva cancelada exitosamente'
        });
      });

      const response = await request(app)
        .patch('/admin/reservations/1/cancel')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Reserva cancelada exitosamente');
      expect(cancelReservationByAdminHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('PATCH /:reservationId/confirm', () => {
    it('debería confirmar una reserva', async () => {
      confirmedReservationByAdminHandler.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Reserva confirmada exitosamente'
        });
      });

      const response = await request(app)
        .patch('/admin/reservations/1/confirm')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Reserva confirmada exitosamente');
      expect(confirmedReservationByAdminHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('PATCH /:reservationId', () => {
    it('debería actualizar una reserva', async () => {
      const updatedReservation = {
        id: 1,
        roomId: 'P2D3',
        numberOfGuests: 3,
        totalPrice: 600
      };

      updateReservationHandler.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: updatedReservation
        });
      });

      const updateData = {
        numberOfGuests: 3,
        totalPrice: 600
      };

      const response = await request(app)
        .patch('/admin/reservations/1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedReservation);
      expect(updateReservationHandler).toHaveBeenCalledTimes(1);
    });

    it('debería manejar errores de validación al actualizar', async () => {
      updateReservationHandler.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Datos de actualización inválidos'
        });
      });

      const response = await request(app)
        .patch('/admin/reservations/1')
        .send({ numberOfGuests: -1 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Datos de actualización inválidos');
    });
  });

  describe('DELETE /:reservationId', () => {
    it('debería eliminar una reserva', async () => {
      deleteReservationByIdHandler.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Reserva eliminada exitosamente'
        });
      });

      const response = await request(app)
        .delete('/admin/reservations/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Reserva eliminada exitosamente');
      expect(deleteReservationByIdHandler).toHaveBeenCalledTimes(1);
    });

    it('debería retornar 404 si la reserva a eliminar no existe', async () => {
      deleteReservationByIdHandler.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Reserva no encontrada para eliminar'
        });
      });

      const response = await request(app)
        .delete('/admin/reservations/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Reserva no encontrada para eliminar');
    });
  });

  describe('Manejo de errores generales', () => {
    it('debería manejar errores del servidor', async () => {
      createReservationHandler.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor'
        });
      });

      const response = await request(app)
        .post('/admin/reservations')
        .send({})
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error interno del servidor');
    });

    it('debería manejar rutas no encontradas', async () => {
      const response = await request(app)
        .get('/admin/reservations/invalid/route')
        .expect(404);
    });
  });

  describe('Validación de parámetros', () => {
    it('debería validar que reservationId sea un número válido', async () => {
      getReservationHandler.getReservationByIdHandler.mockImplementation((req, res) => {
        if (isNaN(req.params.reservationId)) {
          return res.status(400).json({
            success: false,
            message: 'ID de reserva inválido'
          });
        }
        res.status(200).json({ success: true });
      });

      const response = await request(app)
        .get('/admin/reservations/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('ID de reserva inválido');
    });
  });
});
