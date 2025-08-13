const request = require('supertest');
const express = require('express');

// MOCKEAR CONTROLADORES ANTES DE IMPORTAR EL HANDLER
jest.mock('../../../controllers/export/analyticsDataController', () => ({
  getAnalyticsData: jest.fn(),
  getRevenueByRoomType: jest.fn(),
  getFrequentCustomers: jest.fn(),
  getDailyRoomOccupancy: jest.fn(),
}));

jest.mock('../../../controllers/export/analyticsGraphController', () => ({
  getSoldVsUnsoldByDay: jest.fn(),
}));

// MOCKEAR exceljs para que no intente crear archivos reales
jest.mock('exceljs', () => {
  return {
    Workbook: jest.fn(() => ({
      addWorksheet: jest.fn(() => ({
        columns: [],
        addRow: jest.fn(),
        getRow: jest.fn(() => ({ eachCell: jest.fn() })),
        eachRow: jest.fn(),
        addImage: jest.fn(),
      })),
      addImage: jest.fn(),
      xlsx: {
        write: jest.fn(async (res) => {
          // Simular que escribe el Excel en la respuesta y cierra el stream
          res.write('mock excel data');
        }),
      },
    })),
  };
});

// MOCKEAR dayjs con un mock simple
jest.mock('dayjs', () => {
  // Retornamos una función simple sin usar dayjs dentro
  return jest.fn((date) => ({
    format: () => date || '2025-08-09',
    subtract: () => ({
      format: () => '2025-08-02',
      subtract: () => {}, // si se llama más veces
    }),
    diff: () => 6,
    add: (i) => ({
      format: () => `2025-08-0${2 + i}`,
    }),
  }));
});

const dayjs = require('dayjs');
const {
  getAnalyticsData,
  getRevenueByRoomType,
  getFrequentCustomers,
  getDailyRoomOccupancy,
} = require('../../../controllers/export/analyticsDataController');

const { exportAnalyticsToExcel } = require('../../export/analyticsDataHandler');

describe('exportAnalyticsToExcel handler', () => {
  let app;

  beforeAll(() => {
    app = express();

    // Middleware para mockear el header Authorization y simular autorización simple
    app.use((req, res, next) => {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado' });
      }
      next();
    });

    // Registrar la ruta con el handler real
    app.get('/export', exportAnalyticsToExcel);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe devolver status 401 si no se envía token', async () => {
    const res = await request(app).get('/export');
    expect(res.status).toBe(401);
  });

  it(
    'debe devolver status 500 si ocurre un error',
    async () => {
      getAnalyticsData.mockRejectedValueOnce(new Error('Error en datos'));

      const res = await request(app)
        .get('/export')
        .set('Authorization', 'Bearer token123')
        .timeout({ deadline: 10000 });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Error al generar el archivo Excel' });
    },
    15000
  );
});
