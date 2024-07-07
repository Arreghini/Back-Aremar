const express = require("express");
const router = express.Router();
const checkJwt = require("../middlewares/checkJwt");
const userController = require("../controllers/userController");

// Ruta para sincronizar usuario
router.post("/sync", checkJwt, userController.saveUser);

module.exports = router;
