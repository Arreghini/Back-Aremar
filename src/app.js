const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const userRoutes = require('./routes/UsersRoutes');
const roomRoutes = require('./routes/RoomRoutes');
const { checkAdmin, jwtCheck } = require('./services/tokenAdministrador');
require('dotenv').config();

const app = express();
app.name = 'API';

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:4000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Middleware para verificar el token
app.use(jwtCheck); // Aplica jwtCheck a todas las rutas

app.use((req, res, next) => {
  if (!req.auth) {
    console.log('Usuario no autenticado');
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }
  next();
});

// Ruta de autenticación de usuario
app.use('/api/users', jwtCheck, userRoutes)

// Rutas protegidas para administración
app.use('/api/rooms/admin', checkAdmin, roomRoutes);
app.use('/api/users/admin', checkAdmin, userRoutes);

// Rutas públicas
app.get('/public', (req, res) => {
  res.send('Esta es una ruta pública.');
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res) => {
  console.error('Error en la solicitud:', err);
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Token inválido o no proporcionado' });
  }
  res.status(err.status || 500).json({ message: err.message || 'Ocurrió un error en el servidor' });
});

module.exports = app;
