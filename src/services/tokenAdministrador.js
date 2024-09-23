require('dotenv').config();
const jwksRsa = require('jwks-rsa');
const axios = require('axios');
const jwt = require('jsonwebtoken'); // Para firmar/verificar/decodificar tokens
const { expressjwt: jwtMiddleware } = require('express-jwt'); // Para el middleware de autenticación

const { AUTH0_DOMAIN, AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } = process.env;

const namespace = 'https://aremar.com/';

// Middleware para validar el JWT
const jwtAuthMiddleware = jwtMiddleware({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: AUTH0_AUDIENCE,
  issuer: `https://${AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
  credentialsRequired: true, // Asegura que el token esté presente
  requestProperty: 'auth',  // Para usar 'req.auth' en lugar de 'req.user'
});

// Cache para el Management API Token
let cachedManagementToken = null;
let tokenExpiryTime = 0;

// Función para obtener el token de la Auth0 Management API
const getManagementApiToken = async () => {
  if (cachedManagementToken && Date.now() < tokenExpiryTime) {
    return cachedManagementToken;
  }

  try {
    const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    cachedManagementToken = response.data.access_token;
    tokenExpiryTime = Date.now() + response.data.expires_in * 1000; // Guardar el tiempo de expiración
    return cachedManagementToken;
  } catch (error) {
    console.error('Error al obtener el token del Management API:', error);
    throw new Error('Error al obtener el token del Management API');
  }
};

// Función para verificar los roles del usuario
const checkUserRole = async (userId, managementToken) => {
  try {
    // Haz la llamada a Auth0 para obtener los roles del usuario
    const response = await axios.get(`https://${AUTH0_DOMAIN}/api/v2/users/${userId}/roles`, {
      headers: {
        authorization: `Bearer ${managementToken}`, // Token con permisos para la API de gestión
      },
    });

    // Verificar si el usuario tiene el rol de administrador
    const roles = response.data;
    return roles.some(role => role.name === 'admin'); // Cambia 'admin' si el rol tiene otro nombre
  } catch (error) {
    console.error('Error verificando los roles del usuario:', error);
    throw new Error('Error al obtener los roles del usuario');
  }
};

// Middleware para verificar si el usuario es administrador
const checkAdmin = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.sub) {
      throw new Error('No se pudo obtener la información del usuario del token');
    }

    const userId = req.auth.sub;
    const managementToken = await getManagementApiToken();
    const isAdmin = await checkUserRole(userId, managementToken);

    if (isAdmin) {
      return next();
    } else {
      return res.status(403).json({ message: 'Acceso denegado. Usuario no es administrador.' });
    }
  } catch (error) {
    console.error('Error verificando los roles del usuario:', error);
    return res.status(500).json({ message: 'Error interno verificando los roles.' });
  }
};

// Middleware principal: validar JWT y luego verificar el rol
const jwtAndRoleMiddleware = (req, res, next) => {
  jwtAuthMiddleware(req, res, (err) => {
    if (err) {
      console.error('Error al validar el token:', err);
      if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Token inválido o ausente' });
      }
      return res.status(500).json({ message: 'Error interno al procesar el token' });
    }

    // Loguea el token decodificado
    console.log('Token decodificado:', req.auth);
    console.log('req.body:', req.body)

    // Continúa con la verificación de roles
    checkAdmin(req, res, next);
  });
};

module.exports = jwtAndRoleMiddleware;
