const express = require('express');
const router = express.Router();
const jwtAndRoleMiddleware = require('../services/tokenAdministrador'); // Middleware de verificación de administrador

const createRoomHandler = require('../handlers/room/createRoomHandler');
const deleteRoomHandler = require('../handlers/room/deleteRoomHandler');
const getRoomById = require('../handlers/room/getRoomByIdHandler');
const getRoomByQuery = require('../handlers/room/getRoomByQueryHandler');
const getRooms = require('../handlers/room/getRoomHandler');
const updateRoomHandler = require('../handlers/room/updateRoomHandler');

// Rutas públicas
router.get('/all', (req, res, next) => {
  console.log('Solicitud GET /api/rooms/all recibida');
  next();
}, getRooms);

router.get('/', getRoomByQuery);
router.get('/:id', getRoomById);

// Rutas protegidas para administración
router.post('/admin', jwtAndRoleMiddleware, (req, res, next) => {
  console.log('Datos recibidos desde el dashboard:', req.body); // Registrar datos del body
  next();
}, createRoomHandler);

router.delete('/admin/:id', jwtAndRoleMiddleware, deleteRoomHandler);
router.put('/admin/:id', jwtAndRoleMiddleware, updateRoomHandler);
router.patch('/admin/:id', jwtAndRoleMiddleware, updateRoomHandler);

module.exports = router;

