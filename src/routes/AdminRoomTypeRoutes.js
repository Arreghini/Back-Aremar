const express = require('express');
const multer = require('multer');
const getRoomTypeHandler = require('../handlers/room/roomType/getRoomTypeHandler');
const createRoomTypeHandler = require('../handlers/room/roomType/createRoomTypeHandler');
const updateRoomTypeHandler = require('../handlers/room/roomType/updateRoomTypeHandler');
const deleteRoomTypeHandler = require('../handlers/room/roomType/deleteRoomTypeHandler');

const router = express.Router();

// Multer en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', getRoomTypeHandler); // GET /api/rooms/admin/roomType

// POST /api/rooms/admin/roomType con fotos
router.post('/upload', upload.array('photos', 10), createRoomTypeHandler);
router.post('/', upload.array('photos', 10), createRoomTypeHandler);
router.patch('/:id', upload.array('photos', 10), updateRoomTypeHandler);   // PATCH
router.delete('/:id', deleteRoomTypeHandler);  // DELETE

module.exports = router;
