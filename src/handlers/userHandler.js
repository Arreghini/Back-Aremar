const userController = require('../controllers/userController');

exports.handleSaveUser = async (req, res) => {
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
