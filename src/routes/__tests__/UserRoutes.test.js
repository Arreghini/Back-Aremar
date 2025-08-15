jest.mock('../../handlers/user/userHandler', () => ({
  handleSaveUser: jest.fn(),
}));
const { handleSaveUser } = require('../../handlers/user/userHandler');

const request = require('supertest');
const express = require('express');
const userRoutes = require('../UsersRoutes');

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('UserRoutes', () => {
  beforeEach(() => {
    handleSaveUser.mockReset();
  });

  it('✅ POST /users/sync should call SaveUserHandler and return 200 with user data', async () => {
    const mockSavedUser = { id: '123', name: 'Test User', isAdmin: true };
    handleSaveUser.mockResolvedValue(mockSavedUser);

    const response = await request(app)
      .post('/users/sync')
      .set('Authorization', 'Bearer fake-token')
      .send();

    expect(handleSaveUser).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Datos de usuario sincronizados correctamente',
      data: mockSavedUser,
    });
  });

  it('❌ should return 500 if SaveUserHandler throws an error', async () => {
    handleSaveUser.mockRejectedValue(new Error('Fallo'));

    const response = await request(app)
      .post('/users/sync')
      .set('Authorization', 'Bearer fake-token')
      .send();

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Error al sincronizar los datos de usuario' });
  });
});
