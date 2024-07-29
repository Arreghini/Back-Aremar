
const express = require('express');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const routes = require('./routes/index'); // Importa el archivo de rutas consolidado
require('dotenv').config();

const app = express();
app.name = 'API'; // Nombre descriptivo

const { AUTH0_DOMAIN, AUTH0_AUDIENCE } = process.env;

// Configuración de CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:4000'], // Permitir solicitudes desde ambos puertos
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas
  credentials: true // Permitir el uso de cookies
};
app.use(cors(corsOptions));

// Middleware para manejar JSON y cookies
app.use(express.json());
app.use(cookieParser());

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
}).unless({
  path: [
    { url: '/api/rooms', methods: ['POST'] },
    { url: '/api/rooms/:id', methods: ['GET'] },
    { url: '/api/rooms/all', methods: ['GET'] },
    '/public',
    '/another-public-route'
  ]
});

// Aplica el middleware para proteger las rutas necesarias
app.use(checkJwt);

// Rutas
app.use('/api', routes); 

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Ocurrió un error en el servidor' });
});

module.exports = app;
