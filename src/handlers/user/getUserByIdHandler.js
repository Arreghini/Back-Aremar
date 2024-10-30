const getUserByIdController = require('../../controllers/user/getUserControllerById');

const getUserById = async (req, res) => {
  try {
    const id = req.params.id; // Extrae el ID de los parámetros
    const user = await getUserByIdController(id); // Pasa el ID al controlador
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User sent to client:', user);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserhandler:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = getUserById;
