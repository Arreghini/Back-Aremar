// const express = require('express');
// const router = express.Router();

// const reserveRoomHandler = require('../handlers/room/reserveRoomHandler'); // Handler para reservas

// // Rutas públicas
// router.post('/reserve', reserveRoomHandler); // Ruta para reservas

// // Rutas públicas para disponibilidad de habitaciones
// router.get('/all', (req, res, next) => {
//   console.log('Solicitud GET /api/rooms/all recibida');
//   next();
// }, getRooms);

// router.get('/', getRoomByQuery);
// router.get('/:id', getRoomById);

// // Rutas protegidas para administración
// router.post('/', checkAdmin, createRoomHandler);
// router.delete('/:id', checkAdmin, deleteRoomHandler);
// router.put('/:id', checkAdmin, updateRoomHandler);
// router.patch('/:id', checkAdmin, updateRoomHandler);

// module.exports = router;
