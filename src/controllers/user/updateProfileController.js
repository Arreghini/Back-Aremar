
const { User } = require('../../models');

const updateGuestProfileController = async (userId, fieldsToUpdate) => {
  try {
    // Buscar el usuario por ID
    const user = await User.findByPk(userId);

    // Verificar si el usuario existe
    if (!user) {
      throw new Error('User not found');
    }

    // Actualizar los campos del usuario
    const updatedUser = await user.update(fieldsToUpdate);

    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

module.exports = updateGuestProfileController;
