const express = require('express');
const createRoomHandler = require('../handlers/room/createRoomHandler');
const deleteRoomHandler = require('../handlers/room/deleteRoomHandler');
const getRoomById = require('../handlers/room/getRoomByIdHandler');
const getRoomTypeById = require('../handlers/room/roomType/getRoomTypeByRoomIdHandler');
const getRoomHandler = require('../handlers/room/getRoomHandler');
const updateRoomHandler = require('../handlers/room/updateRoomHandler');

const router = express.Router();

router.get('/all', getRoomHandler.getAllRooms);
router.get('/', (req, res, next) => {
  console.log('Datos recibidos desde el cliente para verificar disponibilidad:', req.query); // Registrar query params
  next(); 
}, getRoomHandler.getAvailableRooms);

// Ruta para obtener una habitación específica por ID
router.get('/:id', getRoomById);

router.get('/types', getRoomTypeById);

router.post('/', createRoomHandler);

router.delete('/:id', deleteRoomHandler);

router.patch('/:id', updateRoomHandler);

module.exports = router;
