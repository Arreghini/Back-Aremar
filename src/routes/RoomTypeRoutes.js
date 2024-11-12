const express = require('express');
const getRoomTypeHandler = require('../handlers/room/roomType/getRoomTypeHandler');
const createRoomTypeHandler = require('../handlers/room/roomType/createRoomTypeHandler');
const updateRoomTypeHandler = require('../handlers/room/roomType/updateRoomTypeHandler');
const deleteRoomTypeHandler = require('../handlers/room/deleteRoomHandler');
const { jwtCheck, checkAdmin } = require('../services/tokenAdministrador');

const router = express.Router();

// Ruta pública para obtener tipos de habitación
router.get('/', getRoomTypeHandler);                    // GET /api/rooms/admin/roomType

// Rutas protegidas para crear, actualizar y eliminar tipos de habitación
router.post('/', jwtCheck, checkAdmin, createRoomTypeHandler);       // POST /api/rooms/admin/roomType (protegido)
router.patch('/:id', jwtCheck, checkAdmin, updateRoomTypeHandler);   // PATCH /api/rooms/admin/roomType/:id (protegido)
router.delete('/:id', jwtCheck, checkAdmin, deleteRoomTypeHandler);  // DELETE /api/rooms/admin/roomType/:id (protegido)

module.exports = router;
