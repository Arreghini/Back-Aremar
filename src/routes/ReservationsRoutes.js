const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.post('/reservations', reservationController.createReservation);
router.delete('/reservations/:id', reservationController.deleteReservation);

module.exports = router;
