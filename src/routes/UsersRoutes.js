// routes/userRoutes.js

const { Router } = require('express');
const { handleSaveUser, handleCheckAdminRole } = require('../handlers/user/userHandler');

const router = Router();

// Ruta para sincronizar o guardar usuarios
router.post('/sync', (req, res, next) => {
  console.log('Solicitud recibida en /sync');
  console.log('Datos recibidos:', req.body); // Si esperas datos en el cuerpo de la solicitud
  next(); // Llama a next() para continuar 
}, handleSaveUser);

module.exports = router;











// Nueva ruta para verificar si el usuario es administrador
router.get('/admin', (req, res, next) => {
  console.log('Solicitud recibida en /admin');
  console.log('Datos recibidos:', req.headers.authorization); // Datos del header
  next(); // Llama a next() para continuar
}, handleCheckAdminRole);

module.exports = router;
