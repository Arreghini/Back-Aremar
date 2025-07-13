const { User } = require('../../models');

const getUserByIdController = async (id) => {
  if (!id) {
    throw new Error('User ID is required');
  }
  try {
    const user = await User.findByPk(id);
  if (!user) {
  return null;
}
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

module.exports = getUserByIdController;
