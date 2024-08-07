const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const { AUTH0_DOMAIN, AUTH0_AUDIENCE } = process.env;

const namespace = 'https://clientearemar-api/'; // Asegúrate de que este sea el namespace correcto

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
      return res.status(401).json({ message: 'Invalid token' });
    }

    const roles = req.user[`${namespace}roles`];
    if (roles && roles.includes('admin')) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  });
};

module.exports = checkAdmin;
