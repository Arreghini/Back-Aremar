const express = require('express');
const router = express.Router();
const { checkAdmin } = require('../services/tokenAdministrador'); // Middleware de verificación de administrador

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
router.post('/admin', checkAdmin, (req, res, next) => {
 
  next();
}, createRoomHandler);

router.delete('/admin/:id', checkAdmin, deleteRoomHandler);
router.put('/admin/:id', checkAdmin, updateRoomHandler);
router.patch('/admin/:id', checkAdmin, updateRoomHandler);

module.exports = router;

