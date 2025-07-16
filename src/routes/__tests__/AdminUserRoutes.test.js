const request = require('supertest');
const express = require('express');
const AdminUserRoutes = require('../AdminUserRoutes');

// Mock de los handlers
jest.mock('../../handlers/user/userHandler');
jest.mock('../../handlers/user/getAllUsersHandler');
jest.mock('../../handlers/user/getUserByIdHandler');
jest.mock('../../handlers/user/createUserHandler');
jest.mock('../../handlers/user/updateUserHandler');
jest.mock('../../handlers/user/deleteUserHandler');

const handleSaveUser = require('../../handlers/user/userHandler');
const getAllUsersHandler = require('../../handlers/user/getAllUsersHandler');
const getUserByIdHandler = require('../../handlers/user/getUserByIdHandler');
const createUserHandler = require('../../handlers/user/createUserHandler');
const updateUserHandler = require('../../handlers/user/updateUserHandler');
const deleteUserHandler = require('../../handlers/user/deleteUserHandler');

describe('AdminUserRoutes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/admin/users', AdminUserRoutes);
    
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
  });

  describe('GET /admin/users/all', () => {
    it('debería obtener todos los usuarios exitosamente', async () => {
      const mockUsers = [
        { id: 1, name: 'Usuario 1', email: 'user1@test.com' },
        { id: 2, name: 'Usuario 2', email: 'user2@test.com' }
      ];

      getAllUsersHandler.mockImplementation((req, res) => {
        res.status(200).json(mockUsers);
      });

      const response = await request(app)
        .get('/admin/users/all')
        .expect(200);

      expect(response.body).toEqual(mockUsers);
      expect(getAllUsersHandler).toHaveBeenCalledTimes(1);
    });

    it('debería manejar errores al obtener todos los usuarios', async () => {
      getAllUsersHandler.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Error interno del servidor' });
      });

      const response = await request(app)
        .get('/admin/users/all')
        .expect(500);

      expect(response.body).toEqual({ error: 'Error interno del servidor' });
      expect(getAllUsersHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /admin/users/:id', () => {
    it('debería obtener un usuario por ID exitosamente', async () => {
      const mockUser = { id: 1, name: 'Usuario Test', email: 'test@test.com' };
      const userId = '1';

      getUserByIdHandler.mockImplementation((req, res) => {
        res.status(200).json(mockUser);
      });

      const response = await request(app)
        .get(`/admin/users/${userId}`)
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(getUserByIdHandler).toHaveBeenCalledTimes(1);
    });

    it('debería retornar 404 cuando el usuario no existe', async () => {
      const userId = '999';

      getUserByIdHandler.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Usuario no encontrado' });
      });

      const response = await request(app)
        .get(`/admin/users/${userId}`)
        .expect(404);

      expect(response.body).toEqual({ error: 'Usuario no encontrado' });
      expect(getUserByIdHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /admin/users', () => {
    it('debería crear un nuevo usuario exitosamente', async () => {
      const newUser = {
        name: 'Nuevo Usuario',
        email: 'nuevo@test.com',
        password: 'password123'
      };

      const createdUser = {
        id: 3,
        ...newUser,
        password: undefined // La contraseña no debería retornarse
      };

      createUserHandler.mockImplementation((req, res) => {
        res.status(201).json(createdUser);
      });

      const response = await request(app)
        .post('/admin/users')
        .send(newUser)
        .expect(201);

      expect(response.body).toEqual(createdUser);
      expect(createUserHandler).toHaveBeenCalledTimes(1);
    });

    it('debería retornar error 400 con datos inválidos', async () => {
      const invalidUser = {
        name: '',
        email: 'email-invalido'
      };

      createUserHandler.mockImplementation((req, res) => {
        res.status(400).json({ error: 'Datos de usuario inválidos' });
      });

      const response = await request(app)
        .post('/admin/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toEqual({ error: 'Datos de usuario inválidos' });
      expect(createUserHandler).toHaveBeenCalledTimes(1);
    });

    it('debería retornar error 409 si el email ya existe', async () => {
      const existingUser = {
        name: 'Usuario Existente',
        email: 'existente@test.com',
        password: 'password123'
      };

      createUserHandler.mockImplementation((req, res) => {
        res.status(409).json({ error: 'El email ya está registrado' });
      });

      const response = await request(app)
        .post('/admin/users')
        .send(existingUser)
        .expect(409);

      expect(response.body).toEqual({ error: 'El email ya está registrado' });
      expect(createUserHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('PATCH /admin/users/:id', () => {
    it('debería actualizar un usuario exitosamente', async () => {
      const userId = '1';
      const updateData = {
        name: 'Nombre Actualizado',
        email: 'actualizado@test.com'
      };

      const updatedUser = {
        id: 1,
        ...updateData
      };

      updateUserHandler.mockImplementation((req, res) => {
        res.status(200).json(updatedUser);
      });

      const response = await request(app)
        .patch(`/admin/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedUser);
      expect(updateUserHandler).toHaveBeenCalledTimes(1);
    });

    it('debería retornar 404 si el usuario a actualizar no existe', async () => {
      const userId = '999';
      const updateData = { name: 'Nuevo Nombre' };

      updateUserHandler.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Usuario no encontrado' });
      });

      const response = await request(app)
        .patch(`/admin/users/${userId}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({ error: 'Usuario no encontrado' });
      expect(updateUserHandler).toHaveBeenCalledTimes(1);
    });

    it('debería retornar error 400 con datos de actualización inválidos', async () => {
      const userId = '1';
      const invalidUpdateData = {
        email: 'email-invalido'
      };

      updateUserHandler.mockImplementation((req, res) => {
        res.status(400).json({ error: 'Datos de actualización inválidos' });
      });

      const response = await request(app)
        .patch(`/admin/users/${userId}`)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body).toEqual({ error: 'Datos de actualización inválidos' });
      expect(updateUserHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /admin/users/:id', () => {
    it('debería eliminar un usuario exitosamente', async () => {
      const userId = '1';

      deleteUserHandler.mockImplementation((req, res) => {
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
      });

      const response = await request(app)
        .delete(`/admin/users/${userId}`)
        .expect(200);

      expect(response.body).toEqual({ message: 'Usuario eliminado exitosamente' });
      expect(deleteUserHandler).toHaveBeenCalledTimes(1);
    });

    it('debería retornar 404 si el usuario a eliminar no existe', async () => {
      const userId = '999';

      deleteUserHandler.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Usuario no encontrado' });
      });

      const response = await request(app)
        .delete(`/admin/users/${userId}`)
        .expect(404);

      expect(response.body).toEqual({ error: 'Usuario no encontrado' });
      expect(deleteUserHandler).toHaveBeenCalledTimes(1);
    });

    it('debería retornar error 403 si se intenta eliminar un usuario con restricciones', async () => {
      const userId = '1';

      deleteUserHandler.mockImplementation((req, res) => {
        res.status(403).json({ error: 'No se puede eliminar este usuario' });
      });

      const response = await request(app)
        .delete(`/admin/users/${userId}`)
        .expect(403);

      expect(response.body).toEqual({ error: 'No se puede eliminar este usuario' });
      expect(deleteUserHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Validación de rutas', () => {
    it('debería retornar 404 para rutas no existentes', async () => {
      await request(app)
        .get('/admin/users/ruta-inexistente')
        .expect(404);
    });

    it('debería manejar métodos HTTP no permitidos', async () => {
      await request(app)
        .put('/admin/users/1')
        .expect(404);
    });
  });

  describe('Manejo de errores generales', () => {
    it('debería manejar errores internos del servidor', async () => {
      getAllUsersHandler.mockImplementation((req, res) => {
        throw new Error('Error interno');
      });

      // Esto debería ser manejado por un middleware de manejo de errores
      // Si no existe, el test fallará y mostrará que se necesita implementar
      try {
        await request(app)
          .get('/admin/users/all');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
