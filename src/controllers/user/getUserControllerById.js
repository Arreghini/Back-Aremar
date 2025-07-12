const { User } = require('../../models');

const getUserByIdController = async (id) => {
  try {
    const user = await User.findByPk(id);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

module.exports = getUserByIdController;
