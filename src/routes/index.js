
const { Router } = require("express");
const authRoutes = require('./auth');
const otherRoutes = require('./otherRoutes'); // Tus otras rutas

const router = Router();

router.use('/auth', authRoutes);
router.use('/', otherRoutes);

module.exports = router;
