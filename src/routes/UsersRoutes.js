const { Router } = require("express");
const express = require('express');
const checkJwt = require('../config/jwt');
const { saveUser } = require('../controllers/userController');

const router = Router();

router.post('/users', checkJwt, saveUser);

module.exports = router;

