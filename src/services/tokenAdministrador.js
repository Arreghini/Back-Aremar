require('dotenv').config();
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const axios = require('axios');
const { auth } = require('express-oauth2-jwt-bearer');
const { getManagementApiToken, checkUserRole } = require('../services/roleService');

const { AUTH0_DOMAIN, AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } = process.env;

const namespace = 'https://aremar.com/';

// Middleware global para validar JWT, excepto en rutas públicas
const jwtCheck = auth({
  audience: 'https://clientearemar-api',
  issuerBaseURL: 'https://dev-mgsmdv1ylwl47mj8.us.auth0.com/',
  tokenSigningAlg: 'RS256',
});

// Cache para el Management API Token
let cachedManagementToken = null;
let tokenExpiryTime = 0;

// Función para obtener el token de la Auth0 Management API
// const getManagementApiToken = async () => {
//   if (cachedManagementToken && Date.now() < tokenExpiryTime) {
//     return cachedManagementToken;
//   }

//   try {
//     const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
//       client_id: AUTH0_CLIENT_ID,
//       client_secret: AUTH0_CLIENT_SECRET,
//       audience: AUTH0_AUDIENCE,
//       grant_type: 'client_credentials',
//     });

//     cachedManagementToken = response.data.access_token;
//     tokenExpiryTime = Date.now() + response.data.expires_in * 1000; // Guardar el tiempo de expiración
//     return cachedManagementToken;
//   } catch (error) {
//     console.error('Error al obtener el token del Management API:', error);
//     throw new Error('Error al obtener el token del Management API');
//   }
// };

// Función para verificar los roles del usuario
// const checkUserRole = async (userId, managementToken) => {
//   try {
//     // Haz la llamada a Auth0 para obtener los roles del usuario
//     const response = await axios.get(`https://${AUTH0_DOMAIN}/api/v2/users/${userId}/roles`, {
      
//       headers: {
//         authorization: `Bearer ${managementToken}`, // Token con permisos para la API de gestión
//       },
//     });

//     // Verificar si el usuario tiene el rol de administrador
//     const roles = response.data;
//     return roles.some(role => role.name === 'admin'); // Cambia 'admin' si el rol tiene otro nombre
//   } catch (error) {
//     console.error('Error verificando los roles del usuario:', error);
//     throw new Error('Error al obtener los roles del usuario');
//   }
// };

// Middleware para verificar si el usuario es administrador

const checkAdmin = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.sub) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const managementToken = await getManagementApiToken();
    const isAdmin = await checkUserRole(req.auth.sub, managementToken);

    if (isAdmin) {
      next(); // El usuario es administrador, permitir acceso
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
}
