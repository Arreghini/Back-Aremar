const { User } = require('../../models');

const updateUserController = async (id, updateData) => {
  if (!id || !updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
    throw new Error('ID y datos de actualización son requeridos');
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    await user.update(updateData);

    return user;
  } catch (error) {
    console.error('Error en updateUserController:', error);
    throw error;
  }
};

module.exports = updateUserController;
