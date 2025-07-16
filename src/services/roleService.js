const dotenv = require('dotenv');

function loadEnv() {
  const result = dotenv.config();
  if (!result || !result.parsed) return;

  const parsed = result.parsed;

  for (const key in parsed) {
    if (!process.env[key] && parsed[key] !== '') {
      process.env[key] = parsed[key];
    }
  }
}

// Llamar una vez al cargar el módulo
loadEnv();

async function getManagementApiToken() {
  const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } = process.env;

  try {
    const axios = require('axios');
    const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    return response.data.access_token;
  } catch (error) {
    throw new Error('Error al obtener el token del Management API');
  }
}

async function checkUserRole(userId, token) {
  try {
    const axios = require('axios');
    const { AUTH0_DOMAIN } = process.env;

    const response = await axios.get(
      `https://${AUTH0_DOMAIN}/api/v2/users/${userId}/roles`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const roles = response.data || [];
    return roles.some((role) => role.name === 'admin');
  } catch (error) {
    throw new Error('Error al obtener los roles del usuario');
  }
}

module.exports = {
  loadEnv,
  getManagementApiToken,
  checkUserRole,
};
