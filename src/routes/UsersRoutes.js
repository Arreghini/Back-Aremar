const express = require('express');
const handleSaveUser = require('../handlers/user/userHandler');
const getAllUsersHandler = require('../handlers/user/getAllUsersHandler');
const getUserByIdHandler = require('../handlers/user/getUserByIdHandler');
const createUserHandler = require('../handlers/user/createUserHandler');
const updateUserHandler = require('../handlers/user/updateUserHandler');
const deleteUserHandler = require('../handlers/user/deleteUserHandler');
const { checkAdmin, jwtCheck } = require('../services/tokenAdministrador');
const router = express.Router();

// Middleware para verificar la autenticación en todas las rutas
router.use(jwtCheck, (req, res, next) => {
  next();
});

// Ruta accesible por cualquier usuario autenticado (ej. sincronizar datos de usuario)
router.post('/sync', async (req, res) => {
  console.log('Solicitud recibida en /sync');
  try {
    const savedUser = await handleSaveUser(req); // Llama la función y maneja la respuesta aquí
    res.json({ message: 'Datos de usuario sincronizados correctamente', data: savedUser });
  } catch (error) {
    console.error('Error al sincronizar datos de usuario:', error);
    if (!res.headersSent) { // Verifica si los encabezados ya fueron enviados
      res.status(500).json({ message: 'Error al sincronizar los datos de usuario' });
    }
  }
});

// Rutas protegidas para administradores
// Obtener todos los usuarios
router.get('/admin/all', checkAdmin, async (req, res) => {
  console.log('Ruta GET /admin/all recibida');
  try {
    const result = await getAllUsersHandler(req);
    res.status(200).json({ message: 'Usuarios obtenidos correctamente', data: result });
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
});

// Obtener usuario por ID
router.get('/admin/:id', checkAdmin, async (req, res) => {
  console.log('Ruta GET /admin/:id recibida');
  try {
    const result = await getUserByIdHandler(req);
    res.status(200).json({ message: 'Usuario obtenido correctamente', data: result });
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
});

// Crear un nuevo usuario
router.post('/admin', async (req, res) => {
  try {
    const result = await createUserHandler(req);
    res.status(201).json({ message: 'Usuario creado correctamente', data: result });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
});

// Actualizar usuario
router.patch('/admin/:id', checkAdmin, async (req, res) => {
  try {
    const result = await updateUserHandler(req);
    res.status(200).json({ message: 'Usuario actualizado correctamente', data: result });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
});

// Eliminar usuario
router.delete('/admin/:id', checkAdmin, async (req, res) => {
  console.log('Ruta DELETE recibida');
  try {
    const result = await deleteUserHandler(req);
    res.status(200).json({ message: 'Usuario eliminado correctamente', data: result });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
});

module.exports = router;
