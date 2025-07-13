const { User } = require('../../models');

const getAllUsersController = async (filters = {}) => {
  try {
    const users = await User.findAll({
      where: filters,
    });
    return users;
  } catch (error) {
    console.error('Error fetching users:', error.message);
    throw error;
  }
};

module.exports = getAllUsersController;