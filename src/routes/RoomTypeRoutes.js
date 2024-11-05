// const express = require('express');
// const getRoomTypeHandler = require('../handlers/room/roomType/getRoomTypeHandler');
// const createRoomTypeHandler = require('../handlers/room/roomType/createRoomTypeHandler');
// const updateRoomTypeHandler = require('../handlers/room/roomType/updateRoomTypeHandler');
// const deleteRoomTypeHandler = require('../handlers/room/deleteRoomHandler');

// // Middleware para verificar la autenticación en todas las rutas
// const { checkAdmin, jwtCheck } = require('../services/tokenAdministrador');

// const router = express.Router();
// // Middleware para registrar el encabezado de autorización
// // Rutas protegidas para administración para cargar tipos de habitaciones
// router.get('/admin/roomType', jwtCheck, checkAdmin, getRoomTypeHandler);

// // Rutas protegidas para administración para crear tipos de habitaciones
// router.post('/admin/roomType', jwtCheck, checkAdmin, createRoomTypeHandler);

// // Rutas protegidas para administración para actualizar tipos de habitaciones
// router.patch('/admin/roomType/:id', jwtCheck, checkAdmin, updateRoomTypeHandler);

// // Rutas protegidas para administración para eliminar tipos de habitaciones
// router.delete('/admin/roomType/:id', jwtCheck, checkAdmin, deleteRoomTypeHandler);


// module.exports = router;

const express = require('express');
const getRoomTypeHandler = require('../handlers/room/roomType/getRoomTypeHandler');
const createRoomTypeHandler = require('../handlers/room/roomType/createRoomTypeHandler');
const updateRoomTypeHandler = require('../handlers/room/roomType/updateRoomTypeHandler');
const deleteRoomTypeHandler = require('../handlers/room/deleteRoomHandler');

const router = express.Router();

// Middleware para registrar el encabezado de autorización en cada solicitud
router.use((req, res, next) => {
  console.log('Encabezado de autorización en RoomTypeRoute:', req.headers.authorization);
  next();
});

// Rutas protegidas para administración
router.get('/', getRoomTypeHandler);             // GET /api/rooms/admin/roomType
router.post('/', createRoomTypeHandler);         // POST /api/rooms/admin/roomType
router.patch('/:id', updateRoomTypeHandler);     // PATCH /api/rooms/admin/roomType/:id
router.delete('/:id', deleteRoomTypeHandler);    // DELETE /api/rooms/admin/roomType/:id

module.exports = router;
