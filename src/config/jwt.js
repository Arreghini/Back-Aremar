
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
require('dotenv').config();

const { AUTH0_DOMAIN, AUTH0_AUDIENCE } = process.env;

// Configurar el middleware para verificar tokens JWT automáticamente
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: AUTH0_AUDIENCE,
  issuer: `https://${AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

module.exports = checkJwt;
