const { Router } = require('express');
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const { handleSaveUser, handleCheckAdminRole } = require('../handlers/user/userHandler');
const checkAdmin = require('../services/tokenAdministrador');
require('dotenv').config();

const router = Router();

const { AUTH0_DOMAIN, AUTH0_AUDIENCE } = process.env;

// Configuración del middleware JWT
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: AUTH0_AUDIENCE, // Debe coincidir con lo configurado en el frontend
  issuer: `https://${AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});

// Middleware para validar JWT y agregar información de usuario autenticado
router.use(checkJwt, (req, res, next) => {
  console.log('Respuesta completa de Auth0:', JSON.stringify(req.user, null, 2));
  console.log('Headers de la solicitud:', req.headers);
  next();
});

// Ruta protegida por autenticación, accesible por cualquier usuario autenticado
router.post('/sync', checkJwt, (req, res, next) => {
  console.log('Middleware checkJwt pasado');
  console.log('Solicitud recibida en /sync');
  console.log('Datos recibidos:', req.body);
  console.log('Usuario autenticado:', req.user);
  
  if (!req.user) {
    console.log('req.user is undefined. JWT payload:', req.auth);
    // Si req.user no está definido, usar req.auth
    req.user = req.auth;
  }
  
  next();
}, (req, res, next) => {
  console.log('Antes de llamar a handleSaveUser');
  console.log('req.user:', req.user);
  handleSaveUser(req, res);
});

// Rutas exclusivas para administradores
// Se usa checkAdmin para verificar que el usuario es administrador
router.post('/admin/create', checkAdmin, (req, res) => {
  console.log('Ruta POST /admin/create recibida');
  // Lógica para crear recurso
  res.json({ message: 'Recurso creado por administrador' });
});

router.patch('/admin/update/:id', checkAdmin, (req, res) => {
  console.log('Ruta PATCH /admin/update recibida');
  // Lógica para actualizar recurso
  res.json({ message: `Recurso con ID ${req.params.id} actualizado por administrador` });
});

router.delete('/admin/delete/:id', checkAdmin, (req, res) => {
  console.log('Ruta DELETE /admin/delete recibida');
  // Lógica para eliminar recurso
  res.json({ message: `Recurso con ID ${req.params.id} eliminado por administrador` });
});

module.exports = router;
