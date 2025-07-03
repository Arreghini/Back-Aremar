const express = require('express');
const handleSaveUser = require('../handlers/user/userHandler');
const { jwtCheck } = require('../services/tokenAdministrador');
const router = express.Router();

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

module.exports = router;
