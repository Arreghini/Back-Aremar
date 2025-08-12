const express = require('express');
const request = require('supertest');
const { validationResult } = require('express-validator');
const { getAvailableRoomsValidator } = require('../getAvailableRoomsValidator');

const app = express();

app.get(
  '/available-rooms',
  getAvailableRoomsValidator,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Errores de validación:', errors.array()); // <-- Log para debug
      return res.status(400).json({ message: 'Errores de validación', errors: errors.array() });
    }
    res.status(200).json({ message: 'Valid data' });
  }
);

describe('Validación GET /available-rooms', () => {

  it('❌ debe fallar si un parámetro no cumple validación', async () => {
    const res = await request(app)
      .get('/available-rooms')
      .query({
        roomTypeId: '',
        checkIn: 'abc',
        checkOut: '',
        numberOfGuests: '0',
      });

    expect(res.statusCode).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.some(err => err.path === 'roomTypeId')).toBe(true);
    expect(res.body.errors.some(err => err.path === 'checkIn')).toBe(true);
    expect(res.body.errors.some(err => err.path === 'checkOut')).toBe(true);
    expect(res.body.errors.some(err => err.path === 'numberOfGuests')).toBe(true);
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

  it('❌ debe fallar si numberOfGuests no es un entero', async () => {
    const res = await request(app)
      .get('/available-rooms')
      .query({
        roomTypeId: '1',
        checkIn: '2025-08-10',
        checkOut: '2025-08-15',
        numberOfGuests: '2.5'  // decimal inválido
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(err => err.path === 'numberOfGuests')).toBe(true);
  });

  it('❌ debe fallar si fechas no están en formato ISO8601', async () => {
    const res = await request(app)
      .get('/available-rooms')
      .query({
        roomTypeId: '1',
        checkIn: '10-08-2025',  // formato inválido
        checkOut: '15-08-2025',
        numberOfGuests: '1'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(err => err.path === 'checkIn')).toBe(true);
    expect(res.body.errors.some(err => err.path === 'checkOut')).toBe(true);
  });

  it('❌ debe fallar si falta algún parámetro requerido', async () => {
    const res = await request(app)
      .get('/available-rooms')
      .query({
        checkIn: '2025-08-10',
        checkOut: '2025-08-15',
        numberOfGuests: '2'
      }); // falta roomTypeId

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(err => err.path === 'roomTypeId')).toBe(true);
  });

  it('❌ debe fallar si todos los parámetros están vacíos', async () => {
    const res = await request(app)
      .get('/available-rooms')
      .query({
        roomTypeId: '',
        checkIn: '',
        checkOut: '',
        numberOfGuests: ''
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.length).toBeGreaterThanOrEqual(4);
  });

});
