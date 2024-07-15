require('dotenv').config(); // Cargar variables de entorno
const axios = require('axios'); // Importar axios para hacer solicitudes HTTP
const userService = require('../services/userService'); // Importar el servicio de usuario para guardar o actualizar usuarios
const { User } = require('../models'); // Importar el modelo de usuario

const { AUTH0_DOMAIN } = process.env; // Obtener el dominio de Auth0 desde las variables de entorno

// Definir el controlador saveUser
exports.saveUser = async (req, res) => {
  console.log('Request Body:', req.body);

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

    // Registrar en consola los datos recibidos de Auth0
    console.log('Datos recibidos de Auth0:', userInfo.data);

    // Extraer información del usuario de la respuesta de Auth0
    const { email, name, picture, email_verified } = userInfo.data;

    // Guardar o actualizar el usuario en la base de datos
    const user = await userService.saveOrUpdateUser({
      id: user_id, // Usar `id` en lugar de `user_id` para coincidir con el modelo de la base de datos
      email,
      name,
      picture,
      email_verified,
    });

    // Enviar la información del usuario como respuesta
    res.json(user);
  } catch (error) {
    console.error('Error al guardar el usuario:', error);
    // Enviar una respuesta de error en caso de fallo
    res.status(500).send('Error al guardar el usuario');
  }
};
