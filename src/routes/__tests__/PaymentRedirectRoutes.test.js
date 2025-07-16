const request = require('supertest');
const express = require('express');
const PaymentRedirectRoutes = require('../PaymentRedirectRoutes');

// Crear una aplicación Express para testing
const app = express();
app.use('/payment', PaymentRedirectRoutes);

// Mock de variables de entorno
const originalEnv = process.env;

describe('PaymentRedirectRoutes', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      FRONTEND_URL: 'http://localhost:3000'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('GET /payment/redirect', () => {
    it('debería redirigir correctamente con parámetros válidos', async () => {
      const status = 'success';
      const reservationId = '12345';

      const response = await request(app)
        .get('/payment/redirect')
        .query({ status, reservationId });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(
        `http://localhost:3000/home?status=${status}&reservationId=${reservationId}`
      );
    });

    it('debería manejar status como array y tomar el primer elemento', async () => {
      const status = ['approved', 'pending'];
      const reservationId = '67890';

      const response = await request(app)
        .get('/payment/redirect')
        .query({ status, reservationId });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(
        `http://localhost:3000/home?status=approved&reservationId=${reservationId}`
      );
    });

    it('debería retornar error 400 cuando falta el parámetro status', async () => {
      const reservationId = '12345';

      const response = await request(app)
        .get('/payment/redirect')
        .query({ reservationId });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Parámetros inválidos');
    });

    it('debería retornar error 400 cuando falta el parámetro reservationId', async () => {
      const status = 'success';

      const response = await request(app)
        .get('/payment/redirect')
        .query({ status });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Parámetros inválidos');
    });

    it('debería retornar error 400 cuando faltan ambos parámetros', async () => {
      const response = await request(app)
        .get('/payment/redirect');

      expect(response.status).toBe(400);
      expect(response.text).toBe('Parámetros inválidos');
    });

    it('debería retornar error 400 cuando status es string vacío', async () => {
      const status = '';
      const reservationId = '12345';

      const response = await request(app)
        .get('/payment/redirect')
        .query({ status, reservationId });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Parámetros inválidos');
    });

    it('debería retornar error 400 cuando reservationId es string vacío', async () => {
      const status = 'success';
      const reservationId = '';

      const response = await request(app)
        .get('/payment/redirect')
        .query({ status, reservationId });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Parámetros inválidos');
    });

    it('debería manejar diferentes tipos de status correctamente', async () => {
      const testCases = [
        { status: 'approved', reservationId: '111' },
        { status: 'rejected', reservationId: '222' },
        { status: 'pending', reservationId: '333' },
        { status: 'cancelled', reservationId: '444' }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .get('/payment/redirect')
          .query(testCase);

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe(
          `http://localhost:3000/home?status=${testCase.status}&reservationId=${testCase.reservationId}`
        );
      }
    });

    it('debería usar la URL del frontend desde variables de entorno', async () => {
      process.env.FRONTEND_URL = 'https://mi-frontend.com';
      
      // Recrear la aplicación para que tome la nueva variable de entorno
      const newApp = express();
      delete require.cache[require.resolve('../PaymentRedirectRoutes')];
      const NewPaymentRedirectRoutes = require('../PaymentRedirectRoutes');
      newApp.use('/payment', NewPaymentRedirectRoutes);

      const status = 'success';
      const reservationId = '12345';

      const response = await request(newApp)
        .get('/payment/redirect')
        .query({ status, reservationId });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(
        `https://mi-frontend.com/home?status=${status}&reservationId=${reservationId}`
      );
    });

    it('debería manejar caracteres especiales en los parámetros', async () => {
      const status = 'success';
      const reservationId = 'ABC-123_456';

      const response = await request(app)
        .get('/payment/redirect')
        .query({ status, reservationId });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(
        `http://localhost:3000/home?status=${status}&reservationId=${reservationId}`
      );
    });
  });
});
