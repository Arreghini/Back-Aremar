const getUserByIdController = require('../../controllers/user/getUserByIdController');

const getUserByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await getUserByIdController(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' }); // esta línea debe ejecutarse
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserByIdHandler:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = getUserByIdHandler;
