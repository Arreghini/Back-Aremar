const express = require('express');
const { saveUser } = require('../controllers/userController');
const checkJwt = require('../config/jwt');

const router = express.Router();

router.post('/', checkJwt, saveUser);

module.exports = router;
