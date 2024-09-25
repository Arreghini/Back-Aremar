const { Router } = require('express');
const handleSaveUser = require('../handlers/user/userHandler');
const { checkAdmin } = require('../services/tokenAdministrador');
const { jwtCheck } = require('../services/tokenAdministrador')
require('dotenv').config();

const router = Router();

const { AUTH0_DOMAIN, AUTH0_AUDIENCE } = process.env;

// Todas las rutas para usuarios serán protegidas
router.use((req, res, next) => {
  console.log('Respuesta completa de Auth0:', JSON.stringify(req.user, null, 2));
  next();
});

// Ruta accesible por cualquier usuario autenticado (ej. sincronizar datos de usuario)
router.post('/sync', jwtCheck, (req, res) => {
  console.log('Solicitud recibida en /sync');
  handleSaveUser(req, res);
});

// Rutas exclusivas para administradores
router.post('/admin/create', checkAdmin, (req, res) => {
  console.log('Ruta POST /admin/create recibida');
  res.json({ message: 'Recurso creado por administrador' });
});


router.patch('/admin/update/:id', checkAdmin, (req, res) => {
  console.log('Ruta PATCH /admin/update recibida');
  res.json({ message: `Recurso con ID ${req.params.id} actualizado por administrador` });
});

router.delete('/admin/delete/:id', checkAdmin, (req, res) => {
  console.log('Ruta DELETE /admin/delete recibida');
  res.json({ message: `Recurso con ID ${req.params.id} eliminado por administrador` });
});

module.exports = router;
