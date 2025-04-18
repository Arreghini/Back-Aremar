const express = require('express');
const createRoomHandler = require('../handlers/room/createRoomHandler');
const deleteRoomHandler = require('../handlers/room/deleteRoomHandler');
const getRoomById = require('../handlers/room/getRoomByIdHandler');
const getRoomByQuery = require('../handlers/room/getRoomByQueryHandler');
const getRoomsTypeHandler = require('../handlers/room/roomType/getRoomTypeHandler');
const getRooms = require('../handlers/room/getRoomHandler');
const updateRoomHandler = require('../handlers/room/updateRoomHandler');

const router = express.Router();

// Rutas públicas para consulta de habitaciones
router.get('/all', getRooms.getAllRooms);
router.get('/roomType', getRoomsTypeHandler); // Obtener tipos de habitaciones
router.get('/available', (req, res, next) => {
  console.log('Datos recibidos desde el cliente para verificar disponibilidad:', req.query); // Registrar query params
  next(); // Pasar al siguiente middleware o controlador
}, getRooms.getAvailableRooms);

// Ruta pública para consulta de habitaciones por query
router.get('/', getRoomByQuery);

// Ruta para obtener una habitación específica por ID
router.get('/:id', getRoomById);

router.post('/', (req, res, next) => {
  console.log('Datos recibidos desde el dashboard:', req.body); // Registrar datos del body
  next();
}, createRoomHandler);

router.delete('/:id', (req, res, next) => {
  console.log('Datos recibidos en la solicitud DELETE:', {
    roomId: req.params.id,
    headers: req.headers,
  });
  next();
}, deleteRoomHandler);

router.patch('/:id', updateRoomHandler);

module.exports = router;
