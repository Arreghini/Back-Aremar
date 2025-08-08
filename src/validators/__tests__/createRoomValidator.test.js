
const express = require('express');
const request = require('supertest');
const { createRoomValidatorRules } = require('../createRoomValidator');
const validate = require('../../services/validate');

const app = express();
app.use(express.json());

// Ruta de prueba solo para testear la validación
app.post('/test-validation', createRoomValidatorRules, validate, (req, res) => {
  res.status(200).json({ message: 'Valid data' });
});

describe('createRoomValidationRules', () => {
  it('should fail when required fields are missing', async () => {
    const res = await request(app).post('/test-validation').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should pass when all fields are valid', async () => {
    const res = await request(app).post('/test-validation').send({
      id: 'room123',
      price: 100,
      capacity: 2,
      description: 'Room description'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Valid data');
  });

  it('should fail when price is negative', async () => {
    const res = await request(app).post('/test-validation').send({
      id: 'room123',
      price: -50,
      capacity: 2,
      description: 'Room description'
    });
    expect(res.statusCode).toBe(400);
  });
});
