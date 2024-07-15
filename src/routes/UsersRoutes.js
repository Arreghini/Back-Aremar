
const { Router } = require('express');
const { saveUser } = require('../controllers/userController');
const { handleSaveUser } = require('../handlers/userHandler');

const router = Router();

router.post('/sync', (req, res, next) => {
  console.log('Solicitud recibida en /sync');
  console.log('Datos recibidos:', req.body); // Si esperas datos en el cuerpo de la solicitud
  next(); // Llama a next() para continuar con el controlador saveUser
}, handleSaveUser);

module.exports = router;
