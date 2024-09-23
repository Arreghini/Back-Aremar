// Importar las dependencias necesarias
const express = require('express');
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const routes = require('./routes/index');
const checkAdmin = require('./services/tokenAdministrador');
require('dotenv').config();

// Crear una instancia de la aplicación Express
const app = express();
app.name = 'API';

// Obtener las variables de entorno necesarias
const { AUTH0_DOMAIN, AUTH0_AUDIENCE } = process.env;

// Configurar las opciones de CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:4000'], // Orígenes permitidos
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas
  credentials: true // Permitir el envío de cookies
};
app.use(cors(corsOptions));

// Configurar middleware para parsear JSON y cookies
app.use(express.json());
app.use(cookieParser());

// Middleware para registrar las rutas solicitadas
app.use((req, res, next) => {
  console.log(`Ruta solicitada: ${req.method} ${req.originalUrl}`);
  next();
});

// Configurar el middleware de autenticación JWT
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

// Configurar **rutas públicas** bajo `/api/rooms/public` (no requieren autenticación)
app.use('/api/rooms/public', routes);

// Configurar **rutas protegidas** para administración
app.use('/api/rooms/admin', checkJwt, checkAdmin, routes);
app.use('/api/users/admin', checkJwt, checkAdmin, routes);

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Ocurrió un error en el servidor' });
});

// Exportar la aplicación para su uso en otros archivos
module.exports = app;
