const express = require('express');
const handleSaveUser = require('../handlers/user/userHandler');
const getAllUsersHandler = require('../handlers/user/getAllUsersHandler');
const getUserByIdHandler = require('../handlers/user/getUserByIdHandler');
const createUserHandler = require('../handlers/user/createUserHandler');
const updateUserHandler = require('../handlers/user/updateUserHandler');
const deleteUserHandler = require('../handlers/user/deleteUserHandler');
const router = express.Router();


// Rutas protegidas para administradores
// Obtener todos los usuarios
router.get('/all', getAllUsersHandler); 
// Obtener usuario por ID
router.get('/:id', getUserByIdHandler);
// Crear un nuevo usuario
router.post('/', createUserHandler);
// Actualizar usuario
router.patch('/:id', updateUserHandler);   
// Eliminar usuario
router.delete('/:id', deleteUserHandler);

module.exports = router;
