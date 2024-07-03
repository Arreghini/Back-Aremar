const { User } = require('../models');

exports.saveOrUpdateUser = async ({ user_id, email, username, picture }) => {
  const [user, created] = await User.upsert({
    id: user_id,  // Utiliza user_id de Auth0 como el id en tu base de datos
    username,     // Auth0 puede proporcionar name o nickname, que puedes asignar a username
    email,
    picture,      // Si quieres almacenar la URL de la imagen de perfil
    isActive: true, // Puedes marcar al usuario como activo por defecto
  }, {
    returning: true
  });

  return user;
};
