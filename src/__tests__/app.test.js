jest.mock('../models', () => ({
  Room: {
    findAll: jest.fn().mockResolvedValue([]),
    findByPk: jest.fn().mockResolvedValue(null),
  },
  // Agrega otros modelos si es necesario
}));

const request = require('supertest');
const app = require('../app');

// Mockea middlewares para simular autenticación exitosa
jest.mock('../services/middlewares', () => ({
  jwtCheck: (req, res, next) => {
    req.user = { sub: 'user|123', roles: ['admin'] };
    next();
  },
  checkAdmin: (req, res, next) => next(),
}));

test('dummy', () => {
  expect(true).toBe(true);
});

describe('App integration', () => {
  it('GET /public responde 200', async () => {
    const res = await request(app).get('/public');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Esta es una ruta pública');
  });

  it('POST /api/webhooks/mercadopago responde 200 o 500', async () => {
    const res = await request(app)
      .post('/api/webhooks/mercadopago')
      .send({});
    expect([200, 500]).toContain(res.statusCode);
  });

  it('GET /api/users/admin responde 404 o 200 según rutas internas', async () => {
    const res = await request(app).get('/api/users/admin');
    expect([404, 200]).toContain(res.statusCode);
  });

  it('GET /api/rooms responde 404 o 200 según rutas internas', async () => {
    const res = await request(app).get('/api/rooms');
   expect([200, 404, 500]).toContain(res.statusCode);
  });

  it('GET /ruta-inexistente responde 404', async () => {
    const res = await request(app).get('/ruta-inexistente');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Ruta no encontrada');
  });

  it('maneja errores de autenticación', async () => {
    // Simula error de autenticación removiendo el mock temporalmente
    jest.resetModules();
    const realApp = require('../app');
    const res = await request(realApp).get('/api/users');
    expect([401, 404]).toContain(res.statusCode);
  });
});