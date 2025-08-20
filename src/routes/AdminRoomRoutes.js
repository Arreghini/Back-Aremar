const express = require('express');
const multer = require('multer');
const createRoomHandler = require('../handlers/room/createRoomHandler');
const deleteRoomHandler = require('../handlers/room/deleteRoomHandler');
const getRoomById = require('../handlers/room/getRoomByIdHandler');
const getRoomTypeById = require('../handlers/room/roomType/getRoomTypeByRoomIdHandler');
const getRoomHandler = require('../handlers/room/getRoomHandler');
const updateRoomHandler = require('../handlers/room/updateRoomHandler');
const { createRoomValidatorRules } = require('../validators/createRoomValidator');

// Middleware de validación adaptado a lo que el test espera
const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Errores de validación:', errors.array());
    // 🚨 Cambiado: devolvemos SOLO el objeto que espera el test
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  next();
}

const router = express.Router();



// Obtener todas las habitaciones (sin validadores que bloqueen)
router.get('/all', getRoomHandler.getAllRooms);

// Obtener habitaciones disponibles (solo log y handler)
router.get(
  '/',
  (req, res, next) => {
    console.log(
      'Datos recibidos desde el cliente para verificar disponibilidad:',
      req.query
    );
    next();
  },
  getRoomHandler.getAvailableRooms
);

// Tipos de habitación
router.get('/types', getRoomTypeById);

// Habitación por ID
router.get('/:id', getRoomById);

const upload = multer({ limits: { files: 5 } });
// Configurar multer para aceptar hasta 5 archivos

// Crear habitación (hasta 5 imágenes)
router.post(
  '/',
  (req, res, next) => {
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      upload.array('photoRoom', 5)(req, res, next);
    } else {
      next();
    }
  },
  createRoomValidatorRules,
  validate,
  createRoomHandler
);

// Eliminar habitación
router.delete('/:id', deleteRoomHandler);

// Actualizar habitación (hasta 5 imágenes nuevas)
router.patch('/:id', upload.array('newPhotos', 5), updateRoomHandler);

module.exports = router;
