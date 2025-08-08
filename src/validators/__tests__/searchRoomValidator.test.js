// __tests__/searchRoomsValidator.test.js
const request = require('supertest');
const express = require('express');
const { searchRoomsValidator } = require('../searchRoomValidator');
const { validationResult } = require('express-validator');

describe('searchRoomsValidator', () => {
  let app;

  beforeAll(() => {
    app = express();

    app.get('/search', searchRoomsValidator, (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      res.status(200).json({ success: true });
    });
  });

  test('✅ debería pasar cuando todos los parámetros son válidos', async () => {
    const res = await request(app)
      .get('/search')
      .query({ capacity: 2, priceMin: 100, priceMax: 200 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  test('❌ debería fallar si capacity no es entero positivo', async () => {
    const res = await request(app)
      .get('/search')
      .query({ capacity: -1 });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('La capacidad debe ser un número entero positivo');
  });

  test('❌ debería fallar si priceMin es <= 0', async () => {
    const res = await request(app)
      .get('/search')
      .query({ priceMin: 0 });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('El precio mínimo debe ser mayor que 0');
  });

  test('❌ debería fallar si priceMax es <= 0', async () => {
    const res = await request(app)
      .get('/search')
      .query({ priceMax: -5 });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('El precio máximo debe ser mayor que 0');
  });

  test('❌ debería fallar si priceMax < priceMin (validación cruzada)', async () => {
    const res = await request(app)
      .get('/search')
      .query({ priceMin: 200, priceMax: 100 });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('El precio máximo no puede ser menor que el precio mínimo');
  });

  test('✅ debería pasar si no se envían parámetros (porque son opcionales)', async () => {
    const res = await request(app).get('/search');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});
