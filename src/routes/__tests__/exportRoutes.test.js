const request = require('supertest');
const express = require('express');
const exportRoutes = require('../exportRoutes');
const dayjs = require('dayjs');

// Mock de los controladores
jest.mock('../../controllers/export/analyticsDataController', () => ({
  getAnalyticsData: jest.fn(),
  getRevenueByRoomType: jest.fn(),
  getFrequentCustomers: jest.fn(),
  getDailyRoomOccupancy: jest.fn(),
}));

jest.mock('../../controllers/export/analyticsGraphController', () => ({
  getSoldVsUnsoldByDay: jest.fn(),
}));

// Mock child_process para evitar ejecutar Python en tests
jest.mock('child_process', () => ({
  exec: jest.fn((command, callback) => {
    callback(new Error('Python not available in test environment'), '', '');
  }),
}));

const {
  getAnalyticsData,
  getRevenueByRoomType,
  getFrequentCustomers,
  getDailyRoomOccupancy,
} = require('../../controllers/export/analyticsDataController');

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
        totalPrice: 4500.00,
      },
      {
        name: 'María García',
        email: 'maria@example.com',
        reservationCount: 2,
        totalPrice: 3000.00,
      },
    ];

    const mockOccupancyData = [
      {
        roomId: 1,
        date: '2024-01-01',
        status: 'ocupado',
      },
      {
        roomId: 1,
        date: '2024-01-02',
        status: 'libre',
      },
      {
        roomId: 2,
        date: '2024-01-01',
        status: 'libre',
      },
      {
        roomId: 2,
        date: '2024-01-02',
        status: 'ocupado',
      },
    ];

    beforeEach(() => {
      getAnalyticsData.mockResolvedValue(mockSummaryData);
      getRevenueByRoomType.mockResolvedValue(mockRevenueData);
      getFrequentCustomers.mockResolvedValue(mockFrequentData);
      getDailyRoomOccupancy.mockResolvedValue(mockOccupancyData);
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
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename=analytics_'
      );

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
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename=analytics_'
      );

      // Calcula las fechas por defecto igual que el handler
      const defaultStart = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
      const defaultEnd = dayjs().format('YYYY-MM-DD');

      expect(getAnalyticsData).toHaveBeenCalledWith(defaultStart, defaultEnd);
      expect(getRevenueByRoomType).toHaveBeenCalledWith(defaultStart, defaultEnd);
      expect(getFrequentCustomers).toHaveBeenCalledWith(defaultStart, defaultEnd);
    }, 15000);

    it('debería manejar errores en la generación del Excel', async () => {
      getAnalyticsData.mockRejectedValue(new Error('Error de base de datos'));

      const response = await request(app)
        .get('/export/excel/analytics')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error al generar el archivo Excel');
    }, 15000);

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
