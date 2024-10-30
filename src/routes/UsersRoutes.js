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
router.get('/admin/all', checkAdmin, getAllUsersHandler); 

// Obtener usuario por ID
router.get('/admin/:id', checkAdmin, getUserByIdHandler);

// Crear un nuevo usuario
router.post('/admin', checkAdmin, createUserHandler);

// Actualizar usuario
router.patch('/admin/:id', checkAdmin, updateUserHandler);
   
// Eliminar usuario
router.delete('/admin/:id', checkAdmin, deleteUserHandler);

module.exports = router;
