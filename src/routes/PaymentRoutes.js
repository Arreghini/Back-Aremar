const express = require('express');
const router = express.Router();
const createPreferenceHandler = require('../handlers/reservation/createPreferenceHandler');

router.post('/create-preference', createPreferenceHandler);

module.exports = router;
