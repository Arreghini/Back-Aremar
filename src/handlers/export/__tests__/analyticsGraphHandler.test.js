// tests/handlers/exportAnalyticsGraphToJson.test.js
const request = require('supertest');
const express = require('express');

jest.mock('../../../controllers/export/analyticsGraphController');
const { getSoldVsUnsoldByDay } = require('../../../controllers/export/analyticsGraphController');
const { exportAnalyticsGraphToJson } = require('../../../handlers/export/analyticsGraphHandler');

describe('exportAnalyticsGraphToJson handler', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.get('/graph', exportAnalyticsGraphToJson);
  });

  it('debe devolver datos con status 200 si recibe fechas válidas', async () => {
    const fakeData = [{ date: '2025-08-01', sold: 5, unsold: 3 }];
    getSoldVsUnsoldByDay.mockResolvedValue(fakeData);

    const res = await request(app)
      .get('/graph')
      .query({ startDate: '2025-08-01', endDate: '2025-08-07' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeData);
    expect(getSoldVsUnsoldByDay).toHaveBeenCalledWith('2025-08-01', '2025-08-07');
  });

  it('debe devolver 400 si faltan startDate o endDate', async () => {
    const res = await request(app)
      .get('/graph')
      .query({ startDate: '2025-08-01' }); // Falta endDate

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Parámetros startDate y endDate requeridos' });
    expect(getSoldVsUnsoldByDay).not.toHaveBeenCalled();
  });

  it('debe devolver 500 si getSoldVsUnsoldByDay lanza error', async () => {
    getSoldVsUnsoldByDay.mockRejectedValue(new Error('Error interno'));

    const res = await request(app)
      .get('/graph')
      .query({ startDate: '2025-08-01', endDate: '2025-08-07' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error interno al generar los datos' });
  });
});
