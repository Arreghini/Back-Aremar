
const express = require('express');
const router = express.Router();

const { createRoomHandler } = require('../handlers/room/createRoomHandler');
const { deleteRoomHandler } = require('../handlers/room/deleteRoomHandler');
const { getRoomById } = require('../handlers/room/getRoomByIdHandler');
const { getRoomByQuery } = require('../handlers/room/getRoomByQueryHandler');
const { getRooms } = require('../handlers/room/getRoomHandler');
const { updateRoomHandler } = require('../handlers/room/updateRoomHandler');


router.post('/rooms', createRoomHandler);
router.delete('/rooms/:id', deleteRoomHandler);
router.get('/rooms/:id', getRoomById);
router.get('/rooms', getRoomByQuery);
router.get('/rooms/all', getRooms);
router.put('/rooms/:id', updateRoomHandler);


module.exports = router;
