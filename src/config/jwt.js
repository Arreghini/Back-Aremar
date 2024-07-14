
// const jwt = require('express-jwt');
// const jwksRsa = require('jwks-rsa');
// require('dotenv').config();

// const { AUTH0_DOMAIN, AUTH0_AUDIENCE } = process.env;

// // Configurar el middleware para verificar tokens JWT automáticamente
// const checkJwt = jwt({
//   secret: jwksRsa.expressJwtSecret({
//     cache: true,
//     rateLimit: true,
//     jwksRequestsPerMinute: 5,
//     jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
//   }),
//   audience: AUTH0_AUDIENCE,
//   issuer: `https://${AUTH0_DOMAIN}/`,
//   algorithms: ['RS256']
// });

// module.exports = checkJwt;

// const app = require('../app')
// const jwt = require('express-jwt');
// const jwksRsa = require('jwks-rsa');

// // Dominio de Auth0 (por ejemplo, dev-xxxxxx.us.auth0.com)
// const auth0Domain = process.env.AUTH0_DOMAIN;
// const audience = process.env.AUTH0_AUDIENCE;

// // Middleware de validación JWT
// const checkJwt = jwt({
//   secret: jwksRsa.expressJwtSecret({
//     cache: true,
//     rateLimit: true,
//     jwksUri: `${auth0Domain}.well-known/jwks.json`
//   }),
//   audience: audience,
//   issuer: auth0Domain,
//   algorithms: ['RS256']
// });

// app.use(checkJwt);

// app.get('/api/protected', (req, res) => {
//   res.send('Esta es una ruta protegida');
// });
