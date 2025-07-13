const { User } = require('../../models');

const deleteUserController = async (id) => {
  if (!id) {
    throw new Error('User ID is required');
  }
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }
    await User.destroy({ where: { id } });
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

module.exports = deleteUserController;
