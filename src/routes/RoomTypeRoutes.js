const express = require('express');
const getRoomTypeHandler = require('../handlers/room/roomType/getRoomTypeHandler');
const createRoomTypeHandler = require('../handlers/room/roomType/createRoomTypeHandler');
const updateRoomTypeHandler = require('../handlers/room/roomType/updateRoomTypeHandler');
const deleteRoomTypeHandler = require('../handlers/room/deleteRoomHandler');

// Middleware para verificar la autenticación en todas las rutas
const { checkAdmin, jwtCheck } = require('../services/tokenAdministrador');

const router = express.Router();
// Rutas protegidas para administración para cargar tipos de habitaciones
router.get('/admin/roomType', jwtCheck, checkAdmin, getRoomTypeHandler);

// Rutas protegidas para administración para crear tipos de habitaciones
router.post('/admin/roomType', jwtCheck, checkAdmin, createRoomTypeHandler);

// Rutas protegidas para administración para actualizar tipos de habitaciones
router.patch('/admin/roomType/:id', jwtCheck, checkAdmin, updateRoomTypeHandler);

// Rutas protegidas para administración para eliminar tipos de habitaciones
router.delete('/admin/roomType/:id', jwtCheck, checkAdmin, deleteRoomTypeHandler);


module.exports = router;
