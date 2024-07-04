const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const loginRoutes = require('./routes/login');
const protectedRoutes = require('./routes/protected');

require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use('/login', loginRoutes); // Especificar una ruta base para evitar conflictos
app.use('/protected', protectedRoutes); // Especificar una ruta base para evitar conflictos

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
