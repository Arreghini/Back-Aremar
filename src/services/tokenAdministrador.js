require('dotenv').config();
const { auth } = require('express-oauth2-jwt-bearer');
const {
  getManagementApiToken,
  checkUserRole,
} = require('../services/roleService');

const { AUTH0_DOMAIN, AUTH0_AUDIENCE } = process.env;

const namespace = 'https://aremar.com/';

// Función para verificar el token JWT
const jwtCheck = (req, res, next) => {
  // Imprime el encabezado de autorización
  // console.log('Encabezado de autorización:', req.headers.authorization);

  // Llama a auth() para la verificación del token JWT
  const jwtValidator = auth({
    audience: 'https://clientearemar-api',
    issuerBaseURL: `https://${AUTH0_DOMAIN}/`,
    tokenSigningAlg: 'RS256',
  });

  // Ejecuta el middleware de auth() y pasa el control a `next()`
  jwtValidator(req, res, next);
};

// Cache para el Management API Token
let cachedManagementToken = null;
let tokenExpiryTime = 0;

// Middleware para verificar si el usuario es administrador
// ...existing code...
const checkAdmin = (req, res, next) => {
  try {
    const roles = req.auth?.payload?.[`${namespace}roles`] || [];
    const sub = req.auth?.payload?.sub;

    if (!sub) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (roles.includes('admin')) {
      req.isAdmin = true;
      return next();
    }

    return res.status(403).json({ message: 'Acceso prohibido: No es admin' });
  } catch (error) {
    console.error('Error en checkAdmin:', error);
    return res.status(500).json({ message: 'Error al verificar roles' });
  }
};

module.exports = {
  jwtCheck,
  checkAdmin,
};
