
const axios = require('axios');
const userService = require('../../services/userService');
const { getManagementApiToken, checkUserRole } = require('../../services/roleService');
const { AUTH0_DOMAIN } = process.env;

// Función principal para guardar el usuario
exports.saveUser = async (userData) => {
  const { user_id, authorization } = userData;

  if (!authorization) {
    throw new Error('Authorization header is missing');
  }

  try {
    // Obtener información del usuario desde Auth0
    const userInfo = await axios.get(`https://${AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: authorization,
      },
    });

    console.log('Datos recibidos de Auth0:', userInfo.data);

    const { email, name, picture, email_verified } = userInfo.data;

    // Guardar o actualizar el usuario en la base de datos
    const user = await userService.saveOrUpdateUser({
      id: user_id,
      email,
      name,
      picture,
      email_verified,
    });

    // Obtener el token de Management API
    const managementApiToken = await getManagementApiToken();

    // Verificar si el usuario tiene el rol de administrador
    const isAdmin = await checkUserRole(user_id, managementApiToken);

    console.log('¿El usuario es administrador?', isAdmin);

    return { user, isAdmin };
  } catch (error) {
    console.error('Error al guardar el usuario:', error);
    throw new Error('Error al guardar el usuario');
  }
};
