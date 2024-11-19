const express = require('express');
const router = express.Router();
const { checkAdmin, jwtCheck } = require('../services/tokenAdministrador');
const createReservationHandler = require('../handlers/reservation/createReservationHandler'); // Handler para reservas
const getReservationHandler = require('../handlers/reservation/getReservationsHandler'); // Handler para obtener reservas
const updateReservationHandler = require('../handlers/reservation/updateReservationHandler'); // Handler para actualizar reservas
const deleteReservationHandler = require('../handlers/reservation/deleteReservationHandler'); // Handler para eliminar reservas
const confirmPaymentHandler = require('../handlers/reservation/confirmPaymentHandler'); // Handler para confirmar el pago de una reserva

// Middleware para verificar la autenticación en todas las rutas
router.use(jwtCheck, (req, res, next) => {
  next();
});

// Rutas para reservas de ususarios
router.post('/', createReservationHandler);
router.get('/', getReservationHandler);
router.get('/:id', getReservationHandler);
router.patch('/:id', updateReservationHandler);
router.delete('/:id', deleteReservationHandler);

// Ruta para confirmar el pago de una reserva
router.post('/:id/payment', confirmPaymentHandler);

// Rutas para reservas de administradores
router.post('/admin', checkAdmin, createReservationHandler);
router.get('/admin', checkAdmin, getReservationHandler);
router.get('/admin/:id', checkAdmin, getReservationHandler);
router.patch('/admin/:id', checkAdmin, updateReservationHandler);
router.delete('/admin/: id', checkAdmin, deleteReservationHandler);


module.exports = router;

