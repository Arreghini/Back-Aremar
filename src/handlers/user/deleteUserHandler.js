const deleteUserController = require('../../controllers/user/deleteUserController');

const deleteUserHandler = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    console.log('Datos recibidos desde el dashboard para eliminar el usuario:', {
      id,
      headers: req.headers,
      user: req.user,
    });

    const user = await deleteUserController(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser handler:', error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = deleteUserHandler;
