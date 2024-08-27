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
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE, // Debe coincidir con lo configurado en el frontend
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});
router.use(checkJwt, (req, res, next) => {
  console.log('Respuesta completa de Auth0:', JSON.stringify(req.user, null, 2));
  console.log('Headers de la solicitud:', req.headers);
  next();
});

router.post('/sync', checkJwt, (req, res, next) => {
  console.log('Middleware checkJwt pasado');
  console.log('Solicitud recibida en /sync');
  console.log('Datos recibidos:', req.body);
  console.log('Usuario autenticado:', req.user);
  
  if (!req.user) {
    console.log('req.user is undefined. JWT payload:', req.auth);
    // If req.user is undefined, try to use req.auth instead
    req.user = req.auth;
  }
  
  next();
}, (req, res, next) => {
  console.log('Antes de llamar a handleSaveUser');
  console.log('req.user:', req.user);
  handleSaveUser(req, res);
});


module.exports = router;