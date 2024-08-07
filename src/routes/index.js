
const express = require('express');
const router = express.Router();
const checkAdminHandler = require('../handlers/room/checkAdminHandler')

const protectedRoutes = require('./protected'); // Importa las rutas protegidas
const userRoutes = require('./UsersRoutes'); // Importa las rutas de usuarios
const roomRoutes = require('./RoomRoutes'); // Importa las rutas de habitaciones

// Middleware para las rutas protegidas
router.use('/protected', protectedRoutes);

// Middleware para las rutas de usuarios
router.use('/users', userRoutes);

// Middleware para las rutas de habitaciones
router.get('/rooms/checkAdmin', checkAdminHandler);

module.exports = router;






