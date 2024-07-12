
const { Router } = require('express');
const checkJwt = require('../config/jwt');
const { saveUser } = require('../controllers/userController');

const router = Router();

router.post('/sync', checkJwt, (req, res, next) => {
    console.log('Solicitud recibida en /sync');
    console.log('Datos recibidos:', req.body); // Si esperas datos en el cuerpo de la solicitud
    next(); // Llama a next() para continuar con el controlador saveUser
  }, saveUser);
  

module.exports = router;
