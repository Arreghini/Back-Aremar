const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const { AUTH0_DOMAIN, AUTH0_AUDIENCE } = process.env;

const namespace = 'https://aremar.com/';

const checkAdmin = (req, res, next) => {
  jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: AUTH0_AUDIENCE,
    issuer: `https://${AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
  })(req, res, (err) => {
    if (err) {
      console.log('Error de autenticación:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }

    const roles = req.user[`${namespace}roles`];
    console.log('Roles del usuario:', roles); // Agrega esto para depuración

    if (roles && roles.includes('admin')) {
      console.log('Usuario es administrador.');
      return res.status(200).json({ isAdmin: true });
    } else {
      console.log('Acceso denegado. El usuario no es administrador.');
      return res.status(403).json({ isAdmin: false });
    }
  });
};

module.exports = checkAdmin;
