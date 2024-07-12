const express = require('express');
const checkJwt = require('../config/jwt');

const router = express.Router();

// Aplica checkJwt a todas las rutas dentro de /protected
router.use(checkJwt);

router.get('/', (req, res) => {
  res.send('Protected data');
});

module.exports = router;
