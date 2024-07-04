require('dotenv').config();

const axios = require('axios');
const userService = require('../services/userService');

const { AUTH0_DOMAIN } = process.env;

exports.saveUser = async (req, res) => {
  const { sub: user_id } = req.user;

  try {
    // Obtener datos del usuario desde Auth0
    const userInfo = await axios.get(`https://${AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: req.headers.authorization
      }
    });

    const { email, name, picture } = userInfo.data;

    // Guardar o actualizar el usuario en la base de datos
    const user = await userService.saveOrUpdateUser({ user_id, email, name, picture });
    res.json(user);
  } catch (error) {
    console.error('Error al guardar el usuario:', error);
    res.status(500).send('Error al guardar el usuario');
  }
};
