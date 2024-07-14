const User = require('../models/User');  

exports.saveOrUpdateUser = async ({ user_id, email, name, picture }) => {
  try {
    const user = await User.create({
      id: user_id,  // Utiliza user_id de Auth0 como el id en la base de datos
      name,     // Auth0 puede proporcionar name o nickname, que puedes asignar a username
      email,
      picture,      
      isActive: true, 
    }, {
      returning: true
    });

    return user;
  } catch (error) {
    console.error('Error al guardar o actualizar el usuario:', error);
    throw error;
  }
};
