const express = require('express');
const multer = require('multer');
const createRoomHandler = require('../handlers/room/createRoomHandler');
const deleteRoomHandler = require('../handlers/room/deleteRoomHandler');
const getRoomById = require('../handlers/room/getRoomByIdHandler');
const getRoomTypeById = require('../handlers/room/roomType/getRoomTypeByRoomIdHandler');
const getRoomHandler = require('../handlers/room/getRoomHandler');
const updateRoomHandler = require('../handlers/room/updateRoomHandler');
const validate = require('../services/validate');
const { createRoomValidationRules } = require('../validators/createRoomValidations');
const { searchRoomsValidator } = require('../validators/searchRoomValidator');

const router = express.Router();

// Configurar multer para aceptar archivos en el campo 'photoRoom'
const upload = multer({
  limits: {
    files: 5 // Límite de archivos
  }
});

router.get('/all',   
searchRoomsValidator,
validate,
getRoomHandler.getAllRooms
);

router.get(
  '/',
  (req, res, next) => {
    console.log(
      'Datos recibidos desde el cliente para verificar disponibilidad:',
      req.query
    ); // Registrar query params
    next();
  },
  getRoomHandler.getAvailableRooms
);

// Ruta para obtener una habitación específica por ID
router.get('/types', getRoomTypeById);
router.get('/:id', getRoomById);


// Usar multer.array() para aceptar hasta 5 archivos en el campo 'photoRoom'
router.post('/', 
upload.array('photoRoom', 5),
createRoomValidationRules,
validate,
createRoomHandler);

router.delete('/:id', deleteRoomHandler);

router.patch('/:id', upload.array('newPhotos', 5), updateRoomHandler);

module.exports = router;
