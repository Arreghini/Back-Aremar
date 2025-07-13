const axios = require('axios');
const userService = require('../../services/userService');

const {
  getManagementApiToken,
  checkUserRole,
} = require('../../services/roleService');
const { AUTH0_DOMAIN } = process.env;

// Función principal para guardar el usuario
exports.saveUser = async (userData) => {
  console.log('Función saveUser iniciada');
  console.log('userData recibida:', userData);

  const { user_id, authorization } = userData;

  if (!authorization) {
    console.log('Authorization header faltante');
    throw new Error('Authorization header is missing');
  }

  console.log('Token de autorización:', authorization);

  try {
    // Obtener información del usuario desde Auth0
    let userInfo;
    try {
      console.log('Haciendo solicitud a Auth0...');
      userInfo = await axios.get(`https://${AUTH0_DOMAIN}/userinfo`, {
        headers: {
          Authorization: authorization,
        },
      });
      console.log('Respuesta de Auth0:', userInfo.data);
    } catch (error) {
      console.error('Error completo de Auth0:', error);
      if (error.response && error.response.status === 404) {
        throw new Error('Usuario no encontrado en Auth0');
      } else {
        console.error('Error al comunicarse con Auth0:', error);
        throw new Error('Error de comunicación con Auth0');
      }
    }

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
    let isAdmin = false;
    try {
      isAdmin = await checkUserRole(user_id, managementApiToken);
    } catch (error) {
      console.error('Error al verificar el rol de administrador:', error);
      // Aquí podrías decidir si quieres lanzar un error o simplemente registrar el problema
    }

    console.log('¿El usuario es administrador?', isAdmin);

    return { user, isAdmin };
  } catch (error) {
    console.error('Error al guardar el usuario:', error);
    throw error; // Lanzamos el error original para mantener el mensaje específico
  }
};
