

const { Router } = require('express');
const loginRoutes = require('./login');
const protectedRoutes = require('./protected');
const userRoutes = require('./UsersRoutes'); // Importa las rutas de usuario

const router = Router();

router.use('/login', loginRoutes);
router.use('/protected', protectedRoutes);
router.use('/api/users', userRoutes); // Agrega las rutas de usuario

module.exports = router;
