const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { handleSaveUser } = require('../../handlers/user/userHandler');
const UsersRoutes = require('../../routes/UsersRoutes');

jest.mock('express-jwt', () => ({
  expressjwt: jest.fn(() => (req, res, next) => next())
}));

jest.mock('jwks-rsa', () => ({
  expressJwtSecret: jest.fn()
}));

jest.mock('../../handlers/user/userHandler', () => ({
  handleSaveUser: jest.fn()
}));

describe('UsersRoutes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/users', UsersRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /users/sync', () => {
    it('should call handleSaveUser when a valid request is made', async () => {
      const mockUser = { sub: 'auth0|123', name: 'Test User' };
      const token = jwt.sign(mockUser, 'secret');

      const response = await request(app)
        .post('/users/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({ someData: 'test' });

      expect(response.status).toBe(200);
      expect(handleSaveUser).toHaveBeenCalledTimes(1);
      expect(handleSaveUser).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUser,
          body: { someData: 'test' }
        }),
        expect.any(Object)
      );
    });

    it('should use req.auth if req.user is undefined', async () => {
      const mockAuth = { sub: 'auth0|456', name: 'Another User' };
      const token = jwt.sign(mockAuth, 'secret');

      const response = await request(app)
        .post('/users/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({ someData: 'test' });

      expect(response.status).toBe(200);
      expect(handleSaveUser).toHaveBeenCalledTimes(1);
      expect(handleSaveUser).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockAuth,
          body: { someData: 'test' }
        }),
        expect.any(Object)
      );
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .post('/users/sync')
        .send({ someData: 'test' });

      expect(response.status).toBe(401);
      expect(handleSaveUser).not.toHaveBeenCalled();
    });
  });
});
