const express = require('express');
const getRoomTypeHandler = require('../handlers/room/roomType/getRoomTypeHandler');
const createRoomTypeHandler = require('../handlers/room/roomType/createRoomTypeHandler');
const updateRoomTypeHandler = require('../handlers/room/roomType/updateRoomTypeHandler');
const deleteRoomTypeHandler = require('../handlers/room/deleteRoomHandler');

const router = express.Router();

// Middleware para registrar el encabezado de autorización en cada solicitud
router.use((req, res, next) => {
 // console.log('Encabezado de autorización en RoomTypeRoute:', req.headers.authorization);
  next();
});

// Rutas protegidas para administración
//router.get('/', getRoomTypeHandler);             // GET /api/rooms/admin/roomType

router.get('/', (req, res) => {
//  console.log('Solicitud para obtener tipos de habitación:', req.headers.authorization);
  getRoomTypeHandler(req, res);
});

router.post('/', createRoomTypeHandler);         // POST /api/rooms/admin/roomType
router.patch('/:id', updateRoomTypeHandler);     // PATCH /api/rooms/admin/roomType/:id
router.delete('/:id', deleteRoomTypeHandler);    // DELETE /api/rooms/admin/roomType/:id

module.exports = router;
