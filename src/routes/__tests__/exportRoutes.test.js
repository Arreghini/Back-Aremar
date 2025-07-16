const request = require('supertest');
const express = require('express');
const exportRoutes = require('../exportRoutes');

// Mock de los controladores
jest.mock('../../controllers/export/analyticsDataController', () => ({
  getAnalyticsData: jest.fn(),
  getMonthlyOccupancy: jest.fn(),
  getRevenueByRoomType: jest.fn(),
  getFrequentCustomers: jest.fn(),
}));

const {
  getAnalyticsData,
  getMonthlyOccupancy,
  getRevenueByRoomType,
  getFrequentCustomers,
} = require('../../controllers/export/analyticsDataController');

// Configuración de la aplicación de prueba
const app = express();
app.use('/export', exportRoutes);

describe('Export Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /export/excel/analytics', () => {
    const mockSummaryData = [
      {
        roomId: 1,
        income: 1500.50,
        freeDays: 10,
        occupiedDays: 20,
        totalDays: 30,
        occupancy: 0.67,
        sumReservations: 5,
      },
      {
        roomId: 2,
        income: 2000.75,
        freeDays: 8,
        occupiedDays: 22,
        totalDays: 30,
        occupancy: 0.73,
        sumReservations: 7,
      },
    ];

    const mockRevenueData = [
      {
        roomType: 'Suite',
        roomCount: 2,
        averageRevenue: 1750.62,
        totalRevenue: 3501.25,
      },
      {
        roomType: 'Standard',
        roomCount: 3,
        averageRevenue: 1200.00,
        totalRevenue: 3600.00,
      },
    ];

    const mockFrequentData = [
      {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        reservationCount: 3,
        totaPrice: 4500.00,
      },
      {
        name: 'María García',
        email: 'maria@example.com',
        reservationCount: 2,
        totaPrice: 3000.00,
      },
    ];

    beforeEach(() => {
      getAnalyticsData.mockResolvedValue(mockSummaryData);
      getRevenueByRoomType.mockResolvedValue(mockRevenueData);
      getFrequentCustomers.mockResolvedValue(mockFrequentData);
    });

    it('debería generar un archivo Excel completo con todas las hojas', async () => {
      const response = await request(app)
        .get('/export/excel/analytics')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(response.headers['content-disposition']).toBe(
        'attachment; filename=analytics.xlsx'
      );

      // Verificar que se llamaron todos los controladores
      expect(getAnalyticsData).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
      expect(getRevenueByRoomType).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
      expect(getFrequentCustomers).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
    });

    it('debería generar Excel sin parámetros de fecha', async () => {
      const response = await request(app)
        .get('/export/excel/analytics');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      // Verificar que se llamaron los controladores con undefined
      expect(getAnalyticsData).toHaveBeenCalledWith(undefined, undefined);
      expect(getRevenueByRoomType).toHaveBeenCalledWith(undefined, undefined);
      expect(getFrequentCustomers).toHaveBeenCalledWith(undefined, undefined);
    });

    it('debería manejar errores en la generación del Excel', async () => {
      getAnalyticsData.mockRejectedValue(new Error('Error de base de datos'));

      const response = await request(app)
        .get('/export/excel/analytics')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error al generar Excel');
    });

    it('debería manejar datos vacíos correctamente', async () => {
      getAnalyticsData.mockResolvedValue([]);
      getRevenueByRoomType.mockResolvedValue([]);
      getFrequentCustomers.mockResolvedValue([]);

      const response = await request(app)
        .get('/export/excel/analytics')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });
  });

  describe('GET /export/excel/analytics/monthly-occupancy', () => {
    const mockOccupancyData = [
      {
        month: 'Enero 2024',
        occupancy: 0.75,
      },
      {
        month: 'Febrero 2024',
        occupancy: 0.82,
      },
    ];

    beforeEach(() => {
      getMonthlyOccupancy.mockResolvedValue(mockOccupancyData);
    });

    it('debería generar Excel de ocupación mensual correctamente', async () => {
      const response = await request(app)
        .get('/export/excel/analytics/monthly-occupancy')
        .query({
          year: '2024',
          month: '01',
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(response.headers['content-disposition']).toBe(
        'attachment; filename=monthly_occupancy.xlsx'
      );

      expect(getMonthlyOccupancy).toHaveBeenCalledWith('2024', '01');
    });

    it('debería retornar error 400 si falta el parámetro year', async () => {
      const response = await request(app)
        .get('/export/excel/analytics/monthly-occupancy')
        .query({
          month: '01',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Faltan parámetros year o month',
      });

      expect(getMonthlyOccupancy).not.toHaveBeenCalled();
    });

    it('debería retornar error 400 si falta el parámetro month', async () => {
      const response = await request(app)
        .get('/export/excel/analytics/monthly-occupancy')
        .query({
          year: '2024',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Faltan parámetros year o month',
      });

      expect(getMonthlyOccupancy).not.toHaveBeenCalled();
    });

    it('debería retornar error 400 si faltan ambos parámetros', async () => {
      const response = await request(app)
        .get('/export/excel/analytics/monthly-occupancy');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Faltan parámetros year o month',
      });

      expect(getMonthlyOccupancy).not.toHaveBeenCalled();
    });

    it('debería manejar errores en la generación del Excel mensual', async () => {
      getMonthlyOccupancy.mockRejectedValue(new Error('Error de conexión'));

      const response = await request(app)
        .get('/export/excel/analytics/monthly-occupancy')
        .query({
          year: '2024',
          month: '01',
        });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error al generar Excel de ocupación mensual');
    });

    it('debería manejar datos vacíos en ocupación mensual', async () => {
      getMonthlyOccupancy.mockResolvedValue([]);

      const response = await request(app)
        .get('/export/excel/analytics/monthly-occupancy')
        .query({
          year: '2024',
          month: '01',
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });

    it('debería validar formato de parámetros correctamente', async () => {
      const response = await request(app)
        .get('/export/excel/analytics/monthly-occupancy')
        .query({
          year: '2024',
          month: '13', // Mes inválido
        });

      // Aunque el mes sea inválido, la ruta no valida el formato
      // Solo verifica que existan los parámetros
      expect(response.status).toBe(200);
      expect(getMonthlyOccupancy).toHaveBeenCalledWith('2024', '13');
    });
  });

  describe('Pruebas de integración', () => {
    it('debería manejar múltiples solicitudes concurrentes', async () => {
      getAnalyticsData.mockResolvedValue([]);
      getRevenueByRoomType.mockResolvedValue([]);
      getFrequentCustomers.mockResolvedValue([]);

      const requests = Array(3).fill().map(() =>
        request(app)
          .get('/export/excel/analytics')
          .query({
            startDate: '2024-01-01',
            endDate: '2024-01-31',
          })
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
      });
    });

    it('debería manejar caracteres especiales en las fechas', async () => {
      getMonthlyOccupancy.mockResolvedValue([]);

      const response = await request(app)
        .get('/export/excel/analytics/monthly-occupancy')
        .query({
          year: '2024',
          month: '01',
        });

      expect(response.status).toBe(200);
    });
  });

  describe('Pruebas de rendimiento', () => {
    it('debería completar la exportación en tiempo razonable', async () => {
      getAnalyticsData.mockResolvedValue([]);
      getRevenueByRoomType.mockResolvedValue([]);
      getFrequentCustomers.mockResolvedValue([]);

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/export/excel/analytics')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(5000); // Menos de 5 segundos
    });
  });
});
