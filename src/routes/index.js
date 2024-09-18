
const express = require('express');
const router = express.Router();
const userRoutes = require('./UsersRoutes'); // Importa las rutas de usuarios
const roomRoutes = require('./RoomRoutes'); // Importa las rutas de habitaciones

// Middleware para las rutas de usuarios
router.use('/users', userRoutes);

// Middleware para las rutas de habitaciones
router.use('/rooms', roomRoutes);

module.exports = router;



