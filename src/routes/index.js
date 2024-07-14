
const express = require('express');
const router = express.Router();

const protectedRoutes = require('./protected'); // Importa las rutas protegidas
const userRoutes = require('./UsersRoutes'); 

// Rutas protegidas
router.use('/protected', protectedRoutes);
router.use('/users', userRoutes); 


module.exports = router;
