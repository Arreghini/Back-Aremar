const express = require('express');
const router = express.Router();
const { checkAdmin, jwtCheck } = require('../services/tokenAdministrador');
const createReserveHandler = require('../handlers/reservation/createReservationHandler'); // Handler para reservas
const getReserveHandler = require('../handlers/reservation/getReservationsHandler'); // Handler para obtener reservas
const updateReserveHandler = require('../handlers/reservation/updateReservationHandler'); // Handler para actualizar reservas
const deleteReserveHandler = require('../handlers/reservation/deleteReservationHandler'); // Handler para eliminar reservas

// Middleware para verificar la autenticación en todas las rutas
router.use(jwtCheck, (req, res, next) => {
  next();
});

// Rutas para reservas de ususarios
router.post('/', createReserveHandler);
router.get('/', getReserveHandler);
router.get('/:id', getReserveHandler);
router.patch('/:id', updateReserveHandler);
router.delete('/:id', deleteReserveHandler);

// Rutas para reservas de administradores
router.post('/admin', checkAdmin, createReserveHandler);
router.get('/admin', checkAdmin, getReserveHandler);
router.get('/admin/:id', checkAdmin, getReserveHandler);
router.patch('/admin/:id', checkAdmin, updateReserveHandler);
router.delete('/admin/: id', checkAdmin, deleteReserveHandler);


module.exports = router;

