const express = require('express');
const router = express.Router();

const { createRoomHandler } = require('../handlers/room/createRoomHandler');
const { deleteRoomHandler } = require('../handlers/room/deleteRoomHandler');
const { getRoomById } = require('../handlers/room/getRoomByIdHandler');
const { getRoomByQuery } = require('../handlers/room/getRoomByQueryHandler');
const { getRooms } = require('../handlers/room/getRoomHandler');
const { updateRoomHandler } = require('../handlers/room/updateRoomHandler');

router.post('/', createRoomHandler); // Ruta para crear habitación
router.delete('/:id', deleteRoomHandler);
router.get('/:id', getRoomById);
router.get('/', getRoomByQuery);
router.get('/all', getRooms);
router.put('/:id', updateRoomHandler);

module.exports = router;
