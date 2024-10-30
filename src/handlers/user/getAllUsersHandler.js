
const getUserController = require('../../controllers/user/getUserController');

const getUsers = async (req, res) => {
  try {
    console.log('Solicitud GET /api/users/all recibida'); 
    const users = await getUserController(); // Llama al controlador

    res.status(200).json(users); // Retorna los usuarios
  } catch (error) {
    console.error('Error in getUsers handler:', error); // Mostrar el error en la consola
    res.status(500).json({ message: error.message }); // Retorna el mensaje de error
  }
}

module.exports = getUsers;

