const express = require('express');
const getRoomDetailHandler = require('../handlers/room/roomDetail/getRoomDetailHandler');
const createRoomDetailHandler = require('../handlers/room/roomDetail/createRoomDetailHandler');
const updateRoomDetailHandler = require('../handlers/room/roomDetail/updateRoomDetailHandler');
const deleteRoomDetailHandler = require('../handlers/room/roomDetail/deleteRoomDetailHandler');
const getAllRoomDetailsHandler = require('../handlers/room/roomDetail/getAllRoomDetailsHandler');
const createRoomDetailWithoutIdHandler = require('../handlers/room/roomDetail/createRoomDetailWithoutIdHandler');
const router = express.Router();

// Routes without ID parameters (for getting all and creating new)
router.get('/', getAllRoomDetailsHandler);
router.post('/', createRoomDetailWithoutIdHandler);

// Routes with ID parameters (for specific operations)
router.get('/:id', getRoomDetailHandler);
router.post('/:id', createRoomDetailHandler);
router.patch('/:id', updateRoomDetailHandler);
router.delete('/:id', deleteRoomDetailHandler);

module.exports = router;
