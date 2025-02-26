const express = require('express');
const router = express.Router();
const { checkAdmin, jwtCheck } = require('../services/tokenAdministrador');
const createReservationHandler = require('../handlers/reservation/createReservationHandler');
const getReservationHandler = require('../handlers/reservation/getReservationHandler');
const updateReservationHandler = require('../handlers/reservation/updateReservationHandler');
const deleteReservationByIdHandler = require('../handlers/reservation/deleteReservationByIdHandler');
const createPreferenceHandler = require('../handlers/reservation/createPreferenceHandler');

// Middleware para verificar la autenticación en todas las rutas
router.use(jwtCheck);

// Rutas para usuarios
// Crear una reserva
router.post('/', createReservationHandler);

// Obtener todas las reservas (general o del usuario actual, dependiendo de la lógica en el handler)
router.get('/', getReservationHandler.getAllReservationHandler);

// Obtener todas las reservas de un usuario específico (por `userId`)
router.get('/user/:userId', getReservationHandler.getReservationByUserIdHandler);

// Obtener una reserva específica por su ID
router.get('/:reservationId', getReservationHandler.getReservationByIdHandler);

// Actualizar una reserva
router.patch('/:reservationId', updateReservationHandler);

// Eliminar una reserva
router.delete('/:reservationId', deleteReservationByIdHandler);

// Definir preferencia de pago 
router.post('/:reservationId/create-preference', createPreferenceHandler);

// Rutas exclusivas para administradores

// Crear una reserva como administrador
router.post('/admin', checkAdmin, createReservationHandler);

// Obtener todas las reservas (general) como administrador
router.get('/admin', checkAdmin, getReservationHandler.getAllReservationHandler);

// Obtener una reserva específica como administrador
router.get('/admin/:reservationId', checkAdmin, getReservationHandler.getReservationByIdHandler);

// Actualizar una reserva como administrador
router.patch('/admin/:reservationId', checkAdmin, updateReservationHandler);

// Eliminar una reserva como administrador
router.delete('/admin/:reservationId', checkAdmin, deleteReservationByIdHandler);

module.exports = router;
