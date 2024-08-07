const express = require('express');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const routes = require('./routes/index'); // Importa el archivo de rutas consolidado
const checkAdmin = require('./services/tokenAdministrador'); // Importa el middleware de verificación de administrador
require('dotenv').config();

const app = express();
app.name = 'API'; // Nombre descriptivo

const { AUTH0_DOMAIN, AUTH0_AUDIENCE } = process.env;

// Configuración de CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:4000'], // Permitir solicitudes desde ambos puertos
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas
  credentials: true // Permitir el uso de cookies
};
app.use(cors(corsOptions));

// Middleware para manejar JSON y cookies
app.use(express.json());
app.use(cookieParser());

// Middleware de depuración para ver la ruta solicitada
app.use((req, res, next) => {
  console.log(`Ruta solicitada: ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware para verificar tokens JWT automáticamente
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

// Rutas públicas y no protegidas por autenticación
app.use('/api/public', routes); // Define tus rutas públicas aquí

// Aplica el middleware para proteger todas las rutas después de las rutas públicas
app.use('/api', checkJwt, routes);

// Aplica el middleware de verificación de administrador a las rutas administrativas
app.use('/api/admin', checkJwt, checkAdmin, routes); // Suponiendo que tus rutas administrativas están bajo '/api/admin'

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Ocurrió un error en el servidor' });
});

module.exports = app;
