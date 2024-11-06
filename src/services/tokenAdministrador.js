require('dotenv').config();
const { auth } = require('express-oauth2-jwt-bearer');
const { getManagementApiToken, checkUserRole } = require('../services/roleService');

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
const checkAdmin = async (req, res, next) => {
  try {
   // console.log('Valor de req.auth en checkAdmin al inicio:', req.auth);
    
    if (!req.auth || !req.auth.payload || !req.auth.payload.sub) {
   //   console.log('Estructura inesperada de req.auth:', req.auth);
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    req.user = req.auth.payload;

    console.log('Usuario autenticado con sub:', req.user.sub);

    const managementToken = await getManagementApiToken();
   // console.log('Token de Management API obtenido:', managementToken);

    const isAdmin = await checkUserRole(req.user.sub, managementToken);
    console.log('¿Es administrador?', isAdmin);

    if (isAdmin) {
      next();
    } else {
      return res.status(403).json({ message: 'Acceso prohibido. Solo administradores.' });
    }
  } catch (error) {
    console.error('Error al verificar roles del usuario:', error);
    return res.status(500).json({ message: 'Error al verificar roles del usuario' });
  }
};

module.exports = {
  jwtCheck,
  checkAdmin,
};
