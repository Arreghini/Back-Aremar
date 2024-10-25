const express = require('express');
const createRoomHandler = require('../handlers/room/createRoomHandler');
const deleteRoomHandler = require('../handlers/room/deleteRoomHandler');
const getRoomById = require('../handlers/room/getRoomByIdHandler');
const getRoomByQuery = require('../handlers/room/getRoomByQueryHandler');
const getRooms = require('../handlers/room/getRoomHandler');
const updateRoomHandler = require('../handlers/room/updateRoomHandler');
const { checkAdmin, jwtCheck } = require('../services/tokenAdministrador');

const router = express.Router();

// Rutas protegidas por autenticación
router.get('/all', getRooms);

// Ruta pública para consulta de habitaciones por query
router.get('/', getRoomByQuery);

// Ruta para obtener una habitación específica por ID
router.get('/:id', getRoomById);

// Rutas protegidas para administración (crear, borrar, actualizar habitaciones)
router.post('/', jwtCheck, checkAdmin, (req, res, next) => {
  console.log('Datos recibidos desde el dashboard:', req.body); // Registrar datos del body
  next();
}, createRoomHandler);

router.delete('/admin/:id', jwtCheck, checkAdmin, deleteRoomHandler);
router.put('/admin/:id', jwtCheck, checkAdmin, updateRoomHandler);
router.patch('/admin/:id', jwtCheck, checkAdmin, updateRoomHandler);

module.exports = router;
