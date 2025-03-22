const express = require('express');
const router = express.Router();

const createPreferenceHandler = require('../handlers/reservation/createPreferenceHandler');

router.post('/:reservationId/payment', createPreferenceHandler);

module.exports = router;
