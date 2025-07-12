const { User } = require('../../models');

const deleteUserController = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return null;
    }
    await User.destroy({ where: { id } });
    return user;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

module.exports = deleteUserController;
