
const { Router } = require('express');
const { handleSaveUser } = require('../handlers/user/userHandler');

const router = Router();

router.post('/sync', (req, res, next) => {
  console.log('Solicitud recibida en /sync');
  console.log('Datos recibidos:', req.body); // Si esperas datos en el cuerpo de la solicitud
  next(); // Llama a next() para continuar 
}, handleSaveUser);

module.exports = router;
