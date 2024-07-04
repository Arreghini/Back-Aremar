
const { Router } = require("express");
const router = Router();
const userController = require('../controllers/userController');
const checkJwt = require('../config/jwt');

// Ruta para recibir los datos del usuario
router.post('/users', checkJwt, userController.saveUser);

module.exports = router;
