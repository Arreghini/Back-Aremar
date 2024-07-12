const { Router } = require('express');
const protectedRoutes = require('./protected');
const userRoutes = require('./UsersRoutes'); 

const router = Router();

// Rutas protegidas deben pasar por el middleware de autenticación
router.use('/api/protected', protectedRoutes);
router.use('/api/users', userRoutes); 

module.exports = router;
