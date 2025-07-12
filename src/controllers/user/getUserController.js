const { User } = require('../../models');

const getUserController = async () => {
  try {
    const users = await User.findAll(); // Obtener todos los usuarios
    return users; // Retornar la lista de usuarios
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error; // Lanzar el error para que sea manejado en el handler
  }
};

module.exports = getUserController;
