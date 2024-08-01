
require('dotenv').config(); // Cargar variables de entorno
const axios = require('axios'); // Importar axios para hacer solicitudes HTTP
const userService = require('../../services/userService'); // Importar el servicio de usuario para guardar o actualizar usuarios
const { AUTH0_DOMAIN } = process.env; // Obtener el dominio de Auth0 desde las variables de entorno

exports.saveUser = async (userData) => {
  const { user_id, authorization } = userData;

  if (!authorization) {
    throw new Error('Authorization header is missing');
  }

  try {
    // Hacer una solicitud GET a Auth0 para obtener información del usuario
    const userInfo = await axios.get(`https://${AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: authorization,
      },
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

    return user;
  } catch (error) {
    console.error('Error al guardar el usuario:', error);
    throw new Error('Error al guardar el usuario');
  }
};
