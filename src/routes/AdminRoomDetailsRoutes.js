const express = require('express');
const getRoomDetailHandler = require('../handlers/room/roomDetail/getRoomDetailHandler');
const createRoomDetailHandler = require('../handlers/room/roomDetail/createRoomDetailHandler');
const updateRoomDetailHandler = require('../handlers/room/roomDetail/updateRoomDetailHandler');
const deleteRoomDetailHandler = require('../handlers/room/roomDetail/deleteRoomDetailHandler');
const router = express.Router();

router.get('/', getRoomDetailHandler);
router.post('/', createRoomDetailHandler);
router.patch('/:id', updateRoomDetailHandler);
router.delete('/:id', deleteRoomDetailHandler);

module.exports = router;
