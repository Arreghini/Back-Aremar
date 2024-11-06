const express = require('express');
const router = express.Router();
const { checkAdmin, jwtCheck } = require('../services/tokenAdministrador');

const createReserveHandler = require('../handlers/reservation/createReservationHandler'); // Handler para reservas


// Middleware para verificar la autenticación en todas las rutas
router.use(jwtCheck, (req, res, next) => {
  next();
});

router.post('/', createReserveHandler);
module.exports = router;

