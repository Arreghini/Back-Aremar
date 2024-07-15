
const express = require('express');
const router = express.Router();

const protectedRoutes = require('./protected'); // Importa las rutas protegidas
const userRoutes = require('./UsersRoutes'); // Importa las rutas de usuarios

// Middleware para las rutas protegidas
router.use('/protected', protectedRoutes);

// Middleware para las rutas de usuarios
router.use('/users', userRoutes);

module.exports = router;
