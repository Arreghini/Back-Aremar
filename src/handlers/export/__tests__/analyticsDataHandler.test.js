// tests/handlers/exportAnalyticsToExcel.test.js
const request = require('supertest');
const express = require('express');
const stream = require('stream');
const path = require('path');

jest.mock('exceljs');
jest.mock('dayjs');
jest.mock('fs');
jest.mock('child_process');
jest.mock('../../../controllers/export/analyticsDataController');
jest.mock('../../../controllers/export/analyticsGraphController');

const ExcelJS = require('exceljs');
const dayjs = require('dayjs');
const fs = require('fs');
const {
  getAnalyticsData,
  getRevenueByRoomType,
  getFrequentCustomers,
  getDailyRoomOccupancy,
} = require('../../../controllers/export/analyticsDataController');
const { getSoldVsUnsoldByDay } = require('../../../controllers/export/analyticsGraphController');

const { exportAnalyticsToExcel } = require('../../export/analyticsDataHandler');

describe('exportAnalyticsToExcel handler', () => {
  let app;
  let mockWorkbook;
  let mockWorksheet;
  let mockResponseStream;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.get('/export', exportAnalyticsToExcel);

    // Mock dayjs() to behave simply for format and diff
    dayjs.mockImplementation((date) => {
      return {
        format: () => date || '2025-08-09',
        subtract: () => dayjs('2025-08-02'),
        diff: () => 6,
        add: (i) => dayjs(`2025-08-0${2 + i}`),
      };
    });

    // Mock ExcelJS Workbook and related functions
    mockWorksheet = {
      columns: [],
      addRow: jest.fn(),
      getRow: jest.fn().mockReturnValue({
        eachCell: jest.fn(),
        height: 25,
      }),
      eachRow: jest.fn(),
      addImage: jest.fn().mockReturnValue(123),
      addImageCalls: [],
      addImageCallsArgs: [],
    };
    mockWorksheet.addImage.mockImplementation((imageId, options) => {
      mockWorksheet.addImageCalls.push(imageId);
      mockWorksheet.addImageCallsArgs.push(options);
      return imageId;
    });

    mockWorkbook = {
      addWorksheet: jest.fn(() => mockWorksheet),
      xlsx: {
        write: jest.fn(async (res) => {
          // Simular escribir el Excel como stream
          res.write('excel data');
        }),
      },
    };
    ExcelJS.Workbook.mockImplementation(() => mockWorkbook);

    // Mocks controladores con datos ficticios
    getAnalyticsData.mockResolvedValue([{ roomId: 1, income: 100, freeDays: 2, occupiedDays: 3, totalDays: 5, occupancy: 0.6, sumReservations: 4 }]);
    getRevenueByRoomType.mockResolvedValue([{ roomType: 'Suite', roomCount: 10, averageRevenue: 150, totalRevenue: 1500 }]);
    getFrequentCustomers.mockResolvedValue([{ name: 'Cliente1', email: 'a@b.com', reservationCount: 5, totalPrice: 1000 }]);
    getDailyRoomOccupancy.mockResolvedValue([
      { roomId: '1', date: '2025-08-02', status: 'ocupado' },
      { roomId: '1', date: '2025-08-03', status: 'libre' },
    ]);

    // fs.existsSync para PNG (simulamos que el archivo existe)
    fs.existsSync.mockReturnValue(true);
    fs.unlinkSync.mockImplementation(() => {});

    // Mock generateChart (asumido exportado en el mismo archivo o importado)
    // Para evitar errores, lo definimos aquí como función dummy que resuelve ruta
    const mod = require('../../handlers/export/exportAnalyticsHandler');
    mod.generateChart = jest.fn(async () => ({
      pngPath: path.join(__dirname, '../../../temp_chart.png'),
      svgPath: path.join(__dirname, '../../../temp_chart.svg'),
    }));
  });

  it('debe generar y enviar un archivo Excel con status 200', async () => {
    const res = await request(app)
      .get('/export')
      .set('Authorization', 'Bearer token123');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/spreadsheetml/);
    expect(res.headers['content-disposition']).toMatch(/analytics_/);

    // Controladores llamados
    expect(getAnalyticsData).toHaveBeenCalled();
    expect(getRevenueByRoomType).toHaveBeenCalled();
    expect(getFrequentCustomers).toHaveBeenCalled();
    expect(getDailyRoomOccupancy).toHaveBeenCalled();

    // Workbook creado
    expect(ExcelJS.Workbook).toHaveBeenCalled();
    expect(mockWorkbook.addWorksheet).toHaveBeenCalled();

    // write llamado y res final enviado
    expect(mockWorkbook.xlsx.write).toHaveBeenCalled();
  });

  it('debe devolver status 500 si ocurre un error', async () => {
    getAnalyticsData.mockRejectedValueOnce(new Error('Error en datos'));

    const res = await request(app)
      .get('/export')
      .set('Authorization', 'Bearer token123');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error al generar el archivo Excel' });
  });
});