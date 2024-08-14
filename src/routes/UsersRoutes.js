const { Router } = require('express');
const { handleSaveUser, handleCheckAdminRole } = require('../handlers/user/userHandler');
const checkAdmin = require('../services/tokenAdministrador');

const router = Router();

// Ruta protegida que verifica si el usuario es administrador y redirige al dashboard en el puerto 4000
router.get('/', checkAdmin, (req, res) => {
  res.redirect('http://localhost:4000/');
});

// Ruta para verificar el rol de administrador
router.get('/check-admin', (req, res, next) => {
  console.log('Solicitud recibida en /check-admin');
  console.log('Datos recibidos:', req.headers.authorization); // Datos del header
  next(); // Llama a next() para continuar
}, handleCheckAdminRole);

// Ruta para sincronizar o guardar usuarios
router.post('/sync', (req, res, next) => {
  console.log('Solicitud recibida en /sync');
  console.log('Datos recibidos:', req.body); // Si esperas datos en el cuerpo de la solicitud
  next(); // Llama a next() para continuar 
}, handleSaveUser);

module.exports = router;
