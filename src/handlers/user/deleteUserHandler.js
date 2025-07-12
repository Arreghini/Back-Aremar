const deleteUserController = require('../../controllers/user/deleteUserController');

const deleteUserHandler = async (req, res) => {
  try {
    const id = req.params.id; // Extrae el ID de los parámetros
    console.log(
      'Datos recibidos desde el dashboard para eliminar el usuario:',
      {
        id,
        headers: req.headers,
        user: req.user,
      }
    );
    const user = await deleteUserController(id); // Pasa el ID al controlador
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser handler:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = deleteUserHandler;
