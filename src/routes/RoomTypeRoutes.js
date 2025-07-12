const express = require('express');
const multer = require('multer');
const getRoomTypeHandler = require('../handlers/room/roomType/getRoomTypeHandler');
const createRoomTypeHandler = require('../handlers/room/roomType/createRoomTypeHandler');
const updateRoomTypeHandler = require('../handlers/room/roomType/updateRoomTypeHandler');
const deleteRoomTypeHandler = require('../handlers/room/roomType/deleteRoomTypeHandler');

const router = express.Router();

// Configuración unificada de multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  },
});

router.get('/', getRoomTypeHandler);
router.post(
  '/upload/multiple',
  upload.array('photos', 10),
  createRoomTypeHandler
);
router.patch('/:id', upload.array('photos', 10), updateRoomTypeHandler);
router.delete('/:id', deleteRoomTypeHandler);

module.exports = router;
