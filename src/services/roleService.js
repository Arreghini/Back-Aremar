
require('dotenv').config();
const axios = require('axios');
const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } = process.env;

// Función para obtener el token del Management API
const getManagementApiToken = async () => {
  try {
    const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials'
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

module.exports = {
  getManagementApiToken,
  checkUserRole
};

