const express = require('express');
const handleSaveUser = require('../handlers/user/userHandler');
const { checkAdmin, jwtCheck } = require('../services/tokenAdministrador');
const createRoomHandler  = require('../handlers/room/createRoomHandler');

const router = express.Router();

// Middleware para verificar la autenticación en todas las rutas
router.use(jwtCheck, (req, res, next) => {
  console.log('Respuesta completa de Auth0:', JSON.stringify(req.auth, null, 2));
  next();
});

// Ruta accesible por cualquier usuario autenticado (ej. sincronizar datos de usuario)
router.post('/sync', async (req, res) => {
  console.log('Solicitud recibida en /sync');
  try {
    await handleSaveUser(req, res);
    
    // Verificamos si la respuesta ya fue enviada
    if (!res.headersSent) {
      res.json({ message: 'Datos de usuario sincronizados correctamente' });
    }
  } catch (error) {
    console.error('Error al sincronizar datos de usuario:', error);

    // Verificamos si la respuesta ya fue enviada antes de enviar un mensaje de error
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error al sincronizar los datos de usuario' });
    }
  }
});


// Rutas protegidas para administradores

// Crear un nuevo recurso (ej. habitación)
//router.post('/admin/create', checkAdmin, async (req, res) => {
router.post('/admin/create', async (req, res) => {
  console.log('Ruta POST /admin/create recibida');
  try {
    const result = await createRoomHandler(req, res);  // Llamamos a la función createRoomHandler
    res.status(201).json({ message: 'Habitación creada correctamente', data: result });
  } catch (error) {
    console.error('Error al crear la habitación:', error);
    res.status(500).json({ message: 'Error al crear la habitación' });
  }
});

// Actualizar un recurso por ID (ej. habitación)
router.patch('/admin/update/:id', checkAdmin, async (req, res) => {
  console.log('Ruta PATCH /admin/update recibida');
  try {
    // Aquí debes llamar a la función que maneje la actualización de habitaciones, si la tienes
    res.json({ message: `Habitación con ID ${req.params.id} actualizada correctamente` });
  } catch (error) {
    console.error('Error al actualizar la habitación:', error);
    res.status(500).json({ message: 'Error al actualizar la habitación' });
  }
});

// Eliminar un recurso por ID (ej. habitación)
router.delete('/admin/delete/:id', checkAdmin, async (req, res) => {
  console.log('Ruta DELETE /admin/delete recibida');
  try {
    // Aquí debes llamar a la función que maneje la eliminación de habitaciones, si la tienes
    res.json({ message: `Habitación con ID ${req.params.id} eliminada correctamente` });
  } catch (error) {
    console.error('Error al eliminar la habitación:', error);
    res.status(500).json({ message: 'Error al eliminar la habitación' });
  }
});

module.exports = router;
