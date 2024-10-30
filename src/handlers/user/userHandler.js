const userController = require('../../controllers/user/userController');
const roleService = require('../../services/roleService'); // Importa roleService

const handleSaveUser = async (req) => {
  console.log('handleSaveUser iniciado');
  try {
    if (!req.auth) {
      console.log('Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }

    const user_id = req.auth.payload.sub || req.body.user_id;
    const userData = {
      user_id,
      authorization: req.headers.authorization,
    };

    // Obtener el token del Management API
    const managementToken = await roleService.getManagementApiToken();
    console.log('Token de Management API obtenido:', managementToken);

    // Verificar el rol del usuario
    const isAdmin = await roleService.checkUserRole(user_id, managementToken);
    console.log('Rol del usuario:', isAdmin ? 'admin' : 'no admin');

    // Llamar a saveUser y pasar los datos del usuario
    const savedUser = await userController.saveUser(userData);
    console.log('Usuario guardado:', savedUser);

    // Retorna savedUser incluyendo isAdmin
    return { ...savedUser, isAdmin }; 
  } catch (error) {
    console.error('Error en handleSaveUser:', error);
    throw error;
  }
};

module.exports = handleSaveUser;
