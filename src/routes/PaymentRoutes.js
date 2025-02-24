const express = require('express');
const router = express.Router({ mergeParams: true }); // Importante: mergeParams permite acceder al reservationId
const createPreferenceHandler = require('../handlers/reservation/createPreferenceHandler');

router.post('/', createPreferenceHandler);

module.exports = router;
