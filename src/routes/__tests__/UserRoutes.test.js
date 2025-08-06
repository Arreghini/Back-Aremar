const request = require('supertest');
const express = require('express');

// ✅ Mock del handler antes de importar las rutas
const mockHandleSaveUser = jest.fn();
jest.mock('../../handlers/user/userHandler', () => ({
  handleSaveUser: mockHandleSaveUser
}));

// Ahora importamos después de hacer el mock
const userRoutes = require('../UserRoutes'); // Ruta que usa handleSaveUser

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('UserRoutes', () => {
  beforeEach(() => {
    mockHandleSaveUser.mockReset(); // Limpiamos antes de cada test
  });

  it('✅ POST /users should call handleSaveUser and return 200 with user data', async () => {
    const mockSavedUser = { id: '123', name: 'Test User', isAdmin: true };
    mockHandleSaveUser.mockResolvedValue(mockSavedUser);

    const response = await request(app)
      .post('/users')
      .set('Authorization', 'Bearer fake-token')
      .send();

    expect(mockHandleSaveUser).toHaveBeenCalled(); // Ahora se debería llamar
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockSavedUser);
  });

  it('❌ should return 500 if handleSaveUser throws an error', async () => {
    mockHandleSaveUser.mockRejectedValue(new Error('Fallo'));

    const response = await request(app)
      .post('/users')
      .set('Authorization', 'Bearer fake-token')
      .send();

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error al guardar el usuario' });
  });
});
