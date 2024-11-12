const express = require('express');
const getRoomDetailHandler = require('../handlers/room/roomDetail/getRoomDetailHandler');
const createRoomDetailHandler = require('../handlers/room/roomDetail/createRoomDetailHandler');
const updateRoomDetailHandler = require('../handlers/room/roomDetail/updateRoomDetailHandler');
const deleteRoomDetailHandler = require('../handlers/room/roomDetail/deleteRoomDetailHandler');

// Middleware para verificar la autenticación en todas las rutas
const { checkAdmin, jwtCheck } = require('../services/tokenAdministrador');

const router = express.Router();

// Rutas protegidas para administración para cargar detalles de habitaciones
router.get('/', getRoomDetailHandler);

// Rutas protegidas para administración para crear detalles de habitaciones
router.post('/', jwtCheck, checkAdmin, createRoomDetailHandler);

// Rutas protegidas para administración para actualizar detalles de habitaciones
router.patch('/:id', jwtCheck, checkAdmin, updateRoomDetailHandler);

// Rutas protegidas para administración para eliminar detalles de habitaciones
router.delete('/:id', jwtCheck, checkAdmin, deleteRoomDetailHandler);

module.exports = router;
