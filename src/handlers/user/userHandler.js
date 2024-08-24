const userController = require('../../controllers/user/userController');

const handleSaveUser = async (req, res) => {
  console.log('handleSaveUser iniciado');
  try {
    console.log('Request Body:', req.body);
    console.log('Query Params:', req.query);
    console.log('User object:', req.user);

    if (!req.user) {
      console.log('Usuario no autenticado');
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { sub: user_id } = req.user;

    const userData = {
      user_id,
      authorization: req.headers.authorization,
    };

    console.log('Llamando a userController.saveUser');
    const savedUser = await userController.saveUser(userData);
    console.log('Usuario guardado:', savedUser);
    res.json(savedUser);
  } catch (error) {
    console.error('Error en handleSaveUser:', error);
    res.status(500).send('Error al manejar la solicitud');
  }
};

const handleCheckAdminRole = async (req, res) => {
  try {
    const authorization = req.headers.authorization;
    const user_id = req.query.user_id;

    // Validar que los parámetros requeridos estén presentes
    if (!authorization) {
      return res.status(400).json({ message: 'Authorization header is missing' });
    }
    if (!user_id) {
      return res.status(400).json({ message: 'user_id es necesario' });
    }

    // Obtener el token de la Management API
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
