const { User } = require('../../models');

const getAllUsersHandler = async (req, res) => {
  try {
    const { name, email, sortBy, sortOrder, limit, offset } = req.query;

    const where = {};
    if (name) where.name = name;
    if (email) where.email = email;

    const options = {
      where,
    };

    if (sortBy && sortOrder) {
      options.order = [[sortBy, sortOrder]];
    }

    if (limit) {
      options.limit = parseInt(limit, 10);
    }

    if (offset) {
      options.offset = parseInt(offset, 10);
    }

    const users = await User.findAll(options);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getUsers handler:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = getAllUsersHandler;
