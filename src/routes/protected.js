const express = require('express');
const router = express.Router();

// Ruta protegida que requiere autenticación JWT
router.get('/api/protected', (req, res) => {
  res.send('Esta es una ruta protegida');
});

module.exports = router;

