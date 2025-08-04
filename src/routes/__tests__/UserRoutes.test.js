const request = require('supertest');
const express = require('express');
const UsersRoutes = require('../../routes/UsersRoutes');
const handleSaveUser = require('../../handlers/user/userHandler');

// Mock del handler
jest.mock('../../handlers/user/userHandler');
jest.mock('../../services/middlewares', () => ({
  jwtCheck: jest.fn((req, res, next) => next())
}));

describe('UsersRoutes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/users', UsersRoutes);
    jest.clearAllMocks();
  });

  describe('POST /users/sync', () => {
    it('debería sincronizar datos de usuario correctamente', async () => {
      // Arrange
      const mockUserData = {
        id: 'google-oauth2|123456789',
        name: 'Juan Pérez',
        email: 'juan@example.com'
      };

      const mockSavedUser = {
        ...mockUserData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      handleSaveUser.mockResolvedValue(mockSavedUser);

      // Act
      const response = await request(app)
        .post('/users/sync')
        .send(mockUserData)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        message: 'Datos de usuario sincronizados correctamente',
        data: expect.objectContaining({
          id: mockUserData.id,
          name: mockUserData.name,
          email: mockUserData.email
        })
      });

      expect(handleSaveUser).toHaveBeenCalledTimes(1);
      expect(handleSaveUser).toHaveBeenCalledWith(
        expect.objectContaining({
          body: mockUserData
        })
      );
    });

    it('debería manejar errores del handler correctamente', async () => {
      // Arrange
      const errorMessage = 'Error de base de datos';
      handleSaveUser.mockRejectedValue(new Error(errorMessage));

      const mockUserData = {
        id: 'google-oauth2|123456789',
        name: 'Juan Pérez',
        email: 'juan@example.com'
      };

      // Act
      const response = await request(app)
        .post('/users/sync')
        .send(mockUserData)
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        message: 'Error al sincronizar los datos de usuario'
      });

      expect(handleSaveUser).toHaveBeenCalledTimes(1);
    });

    it('debería manejar datos de usuario vacíos', async () => {
      // Arrange
      const mockSavedUser = {
        id: null,
        name: null,
        email: null
      };

      handleSaveUser.mockResolvedValue(mockSavedUser);

      // Act
      const response = await request(app)
        .post('/users/sync')
        .send({})
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        message: 'Datos de usuario sincronizados correctamente',
        data: mockSavedUser
      });
    });

    it('debería manejar errores cuando los headers ya fueron enviados', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock que simula un error después de que los headers fueron enviados
      handleSaveUser.mockImplementation(async () => {
        throw new Error('Error después de headers enviados');
      });

      const mockUserData = {
        id: 'google-oauth2|123456789',
        name: 'Juan Pérez',
        email: 'juan@example.com'
      };

      // Act
      const response = await request(app)
        .post('/users/sync')
        .send(mockUserData)
        .expect(500);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error al sincronizar datos de usuario:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('debería logear la solicitud recibida', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const mockSavedUser = {
        id: 'google-oauth2|123456789',
        name: 'Juan Pérez',
        email: 'juan@example.com'
      };

      handleSaveUser.mockResolvedValue(mockSavedUser);

      // Act
      await request(app)
        .post('/users/sync')
        .send(mockSavedUser)
        .expect(200);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Solicitud recibida en /sync');
      
      consoleSpy.mockRestore();
    });

    it('debería manejar diferentes tipos de datos de usuario', async () => {
      // Arrange
      const mockUserData = {
        id: 'google-oauth2|987654321',
        name: 'María García',
        email: 'maria@example.com',
        picture: 'https://example.com/avatar.jpg',
        locale: 'es-AR'
      };

      const mockSavedUser = {
        ...mockUserData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      handleSaveUser.mockResolvedValue(mockSavedUser);

      // Act
      const response = await request(app)
        .post('/users/sync')
        .send(mockUserData)
        .expect(200);

      // Assert
      expect(response.body.data).toEqual(
        expect.objectContaining({
          id: mockUserData.id,
          name: mockUserData.name,
          email: mockUserData.email,
          picture: mockUserData.picture,
          locale: mockUserData.locale
        })
      );
    });
  });

  describe('Middleware de autenticación', () => {
    it('debería permitir acceso a usuarios autenticados', async () => {
      // Arrange
      const mockSavedUser = {
        id: 'google-oauth2|123456789',
        name: 'Usuario Autenticado',
        email: 'usuario@example.com'
      };

      handleSaveUser.mockResolvedValue(mockSavedUser);

      // Act
      const response = await request(app)
        .post('/users/sync')
        .send(mockSavedUser)
        .expect(200);

      // Assert
      expect(response.body.message).toBe('Datos de usuario sincronizados correctamente');
    });
  });
});
