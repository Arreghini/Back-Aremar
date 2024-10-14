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
router.get('/all', getRooms);
router.get('/', getRoomByQuery);
router.get('/:id', getRoomById);

// Rutas protegidas para administración
//router.post('/admin', checkAdmin, (req, res, next) => {
  router.post('/', (req, res, next) => {
  console.log('Datos recibidos desde el dashboard:', req.body); // Registrar datos del body
  next();
}, createRoomHandler);

router.delete('/admin/:id', checkAdmin, deleteRoomHandler);
router.put('/admin/:id', checkAdmin, updateRoomHandler);
router.patch('/admin/:id', checkAdmin, updateRoomHandler);

module.exports = router;

