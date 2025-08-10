const express = require('express');
const request = require('supertest');
const { validationResult } = require('express-validator');
const { getAvailableRoomsValidator } = require('../../validators/getAvailableRoomsValidator');

const app = express();

app.get(
  '/available-rooms',
  getAvailableRoomsValidator,
  (req, res) => {
    // Revisar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Errores de validación', errors: errors.array() });
    }
    // Respuesta en caso de éxito (dummy)
    res.status(200).json({ message: 'Valid data' });
  }
);

describe('GET /available-rooms validator', () => {
  it('❌ debe fallar si un parámetro no cumple validación', async () => {
    const res = await request(app)
      .get('/available-rooms')
      .query({
        roomTypeId: '',   // vacío para forzar error
        checkIn: 'abc',   // formato inválido
        checkOut: '',     // vacío para forzar error
        numberOfGuests: '0' // valor inválido
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(err => err.param === 'roomTypeId')).toBe(true);
    expect(res.body.errors.some(err => err.param === 'checkIn')).toBe(true);
    expect(res.body.errors.some(err => err.param === 'checkOut')).toBe(true);
    expect(res.body.errors.some(err => err.param === 'numberOfGuests')).toBe(true);
  });

  it('✅ debe pasar cuando todos los campos son válidos', async () => {
    const res = await request(app)
      .get('/available-rooms')
      .query({
        roomTypeId: '1',
        checkIn: '2025-08-10',
        checkOut: '2025-08-15',
        numberOfGuests: '2'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Valid data');
  });
});
