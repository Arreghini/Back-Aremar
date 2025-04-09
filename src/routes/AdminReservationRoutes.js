const express = require('express');
const router = express.Router();
const createReservationHandler = require('../handlers/reservation/createReservationHandler');
const getReservationHandler = require('../handlers/reservation/getReservationHandler');
const updateReservationHandler = require('../handlers/reservation/updateReservationHandler');
const deleteReservationByIdHandler = require('../handlers/reservation/deleteReservationByIdHandler');
const createPreferenceHandler = require('../handlers/reservation/createPreferenceHandler');

// Rutas exclusivas para administradores

// Crear una reserva como administrador
router.post('/', createReservationHandler);

// Obtener todas las reservas (general) como administrador
router.get('/', getReservationHandler.getAllReservationHandler);

// Obtener una reserva específica como administrador
router.get('/:reservationId', getReservationHandler.getReservationByIdHandler);

// Actualizar una reserva como administrador
router.patch('/:reservationId', updateReservationHandler);

// Eliminar una reserva como administrador
router.delete('/:reservationId', deleteReservationByIdHandler);

module.exports = router;
