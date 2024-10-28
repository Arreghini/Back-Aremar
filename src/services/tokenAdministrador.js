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
  issuerBaseURL: `https://${AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256',
});

// Cache para el Management API Token
let cachedManagementToken = null;
let tokenExpiryTime = 0;

// Middleware para verificar si el usuario es administrador
const checkAdmin = async (req, res, next) => {
  try {
    // Verifica que `req.auth` tenga el payload y el sub esté presente
    if (!req.auth || !req.auth.payload || !req.auth.payload.sub) {
      console.log('Estructura inesperada de req.auth:', req.auth);
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    // Agrega el payload del token al objeto de solicitud
    req.user = req.auth.payload;

    console.log('Usuario autenticado con sub:', req.user.sub);

    // Obtener el token del Management API
    const managementToken = await getManagementApiToken();
    console.log('Token de Management API obtenido:', managementToken);

    // Verificar si el usuario tiene el rol de administrador
    const isAdmin = await checkUserRole(req.user.sub, managementToken);
    console.log('¿Es administrador?', isAdmin);

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
