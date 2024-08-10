// handlers/user/userHandler.js

const userController = require('../../controllers/user/userController');

const handleSaveUser = async (req, res) => {
  try {
    console.log('Request Body:', req.body);

    // Extraer el user_id del token JWT decodificado (req.user)
    const { sub: user_id } = req.user;

    const userData = {
      user_id,
      authorization: req.headers.authorization,
    };

    const savedUser = await userController.saveUser(userData);
    res.json(savedUser);
  } catch (error) {
    console.error('Error al manejar la solicitud:', error);
    res.status(500).send('Error al manejar la solicitud');
  }
};

const handleCheckAdminRole = async (req, res) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(400).json({ message: 'Authorization header is missing' });
    }

    const user_id = req.query.user_id; // Supongamos que se pasa el user_id como parámetro de consulta

    if (!user_id) {
      return res.status(400).json({ message: 'user_id es necesario' });
    }

    // Obtener el token de Management API
    const managementApiToken = await userController.getManagementApiToken();

    // Verificar si el usuario tiene el rol de administrador
    const isAdmin = await userController.checkUserRole(user_id, managementApiToken);

    res.status(200).json({ isAdmin });
  } catch (error) {
    console.error('Error al verificar el rol del usuario:', error);
    res.status(500).json({ message: 'Error al verificar el rol del usuario' });
  }
};

module.exports = { handleSaveUser, handleCheckAdminRole };
