
require('dotenv').config();
const axios = require('axios');
const userService = require('../../services/userService');
const { AUTH0_DOMAIN } = process.env;

// Función para obtener el token del Management API
const getManagementApiToken = async () => {
  try {
    const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials'|
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error al obtener el token del Management API:', error);
    throw new Error('Error al obtener el token del Management API');
  }
};

// Función para verificar los roles del usuario
const checkUserRole = async (user_id, token) => {
  try {
    const rolesResponse = await axios.get(`https://${AUTH0_DOMAIN}/api/v2/users/${user_id}/roles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const roles = rolesResponse.data.map(role => role.name);
    console.log('Roles del usuario:', roles);

    return roles.includes('admin'); // Verifica si el usuario tiene el rol de administrador
  } catch (error) {
    console.error('Error al obtener los roles del usuario:', error);
    throw new Error('Error al obtener los roles del usuario');
  }
};

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
