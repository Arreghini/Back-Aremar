const express = require('express');
const router = express.Router();

const reserveRoomHandler = require('../handlers/room/reserveRoomHandler'); // Handler para reservas
const { jwtCheck } = require('../services/tokenAdministrador');

// Rutas públicas para evaluar disponibilidad de reservas  
router.post('/reserve', reserveRoomHandler); // Ruta para reservas

// Rutas públicas para disponibilidad de habitaciones
router.get('/all', (req, res, next) => {
  console.log('Solicitud GET /api/rooms/all recibida');
  next();
}, getRooms);

router.get('/', getRoomByQuery);
router.get('/:id', getRoomById);

// Rutas protegidas para administración
router.post('/', checkAdmin, createRoomHandler);
router.delete('/:id', checkAdmin, deleteRoomHandler);
router.put('/:id', checkAdmin, updateRoomHandler);
router.patch('/:id', checkAdmin, updateRoomHandler);


// Confirmación automática de reserva al hacer el pago
app.patch('/api/reservations/:id/confirm', confirmReservationAfterPayment);

// Rutas para administración de reservas
app.put('/api/admin/reservations/:id', adminUpdateReservation); // Actualizar detalles
app.patch('/api/admin/reservations/:id/status', adminUpdateReservationStatus); // Cambiar estado (confirmar/cancelar)

module.exports = router;