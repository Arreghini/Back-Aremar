const express = require('express');
const getRoomTypeHandler = require('../handlers/room/roomType/getRoomTypeHandler');
const createRoomTypeHandler = require('../handlers/room/roomType/createRoomTypeHandler');
const updateRoomTypeHandler = require('../handlers/room/roomType/updateRoomTypeHandler');
const deleteRoomTypeHandler = require('../handlers/room/roomType/deleteRoomTypeHandler');

const router = express.Router();

router.get('/', getRoomTypeHandler);                    // GET /api/rooms/admin/roomType
router.post('/', createRoomTypeHandler);       // POST /api/rooms/admin/roomType (protegido)
router.patch('/:id', updateRoomTypeHandler);   // PATCH /api/rooms/admin/roomType/:id (protegido)
router.delete('/:id', deleteRoomTypeHandler);  // DELETE /api/rooms/admin/roomType/:id (protegido)

module.exports = router;
