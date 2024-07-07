const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const routes = require('./index'); // Importar el archivo de rutas consolidado

require('dotenv').config();

const app = express();
app.name = "API"; // Nombre descriptivo

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use('/', routes); // Usar el archivo de rutas consolidado

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
