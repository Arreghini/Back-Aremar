require('dotenv').config(); // Cargar variables de entorno
const axios = require('axios'); // Importar axios para hacer solicitudes HTTP
const userService = require('../services/userService'); // Importar el servicio de usuario para guardar o actualizar usuarios

const { AUTH0_DOMAIN } = process.env; // Obtener el dominio de Auth0 desde las variables de entorno

// Definir el controlador saveUser
exports.saveUser = async (req, res) => {
  // Extraer el user_id del token JWT decodificado (req.user)
  const { sub: user_id } = req.user;

  try {
    // Hacer una solicitud GET a Auth0 para obtener información del usuario
    const userInfo = await axios.get(`https://${AUTH0_DOMAIN}/userinfo`, {
      headers: {
        // Incluir el token JWT en el header Authorization
        Authorization: req.headers.authorization
      }
    });

    // Extraer información del usuario de la respuesta de Auth0
    const { email, name, picture } = userInfo.data;

    // Guardar o actualizar el usuario en la base de datos
    const user = await userService.saveOrUpdateUser({ user_id, email, name, picture });

    // Enviar la información del usuario como respuesta
    res.json(user);
  } catch (error) {
    console.error('Error al guardar el usuario:', error);
    // Enviar una respuesta de error en caso de fallo
    res.status(500).send('Error al guardar el usuario');
  }
};
