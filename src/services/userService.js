// const User = require('../models/User');  

// exports.saveOrUpdateUser = async ({ user_id, email, name, picture }) => {
//   try {
//     const user = await User.upsert({
//       id: user_id,  // Utiliza user_id de Auth0 como el id en la base de datos
//       name,     // Auth0 puede proporcionar name o nickname, que puedes asignar a username
//       email,
//       picture,      
//       isActive: true, 
//     }, {
//       returning: true
//     });

//     return user;
//   } catch (error) {
//     console.error('Error al guardar o actualizar el usuario:', error);
//     throw error;
//   }
// };


// const { User } = require('../models');

// exports.saveOrUpdateUser = async ({ id, email, name, picture, email_verified }) => {

//   console.log('datos recibidos de auth0:',id,email,name)
//   try {
//     // Buscar si el usuario ya existe
//     let user = await User.findOne({ where: { id } });

//     if (user) {
//       // Si el usuario existe, actualizarlo
//       user = await user.update({ email, name, picture, email_verified });
//     } else {
//       // Si el usuario no existe, crearlo
//       user = await User.create({ id, email, name, picture, email_verified });
//     }

//     return user;
//   } catch (error) {
//     throw new Error('Error al guardar o actualizar el usuario');
//   }
// };


//  const User = require('../models/User');  
// exports.saveOrUpdateUser = async ({ id, email, name, picture, email_verified }) => {
//   try {
//     let [user, created] = await User.findOrCreate({
//       where: { id },
//       defaults: { email, name, picture, email_verified }
//     });

//     if (!created) {
//       user = await user.update({ email, name, picture, email_verified });
//     }

//     return user;
//   } catch (error) {
//     console.error('Error en saveOrUpdateUser:', error);
//     throw new Error('Error al guardar o actualizar el usuario');
//   }
// };

// src/services/userService.js

const { User } = require('../models'); // Asegúrate de que esta ruta es correcta

exports.saveOrUpdateUser = async ({ id, email, name, picture, email_verified }) => {
  try {
    let [user, created] = await User.findOrCreate({
      where: { id },
      defaults: { email, name, picture, email_verified },
    });

    if (!created) {
      user = await user.update({ email, name, picture, email_verified });
    }

    return user;
  } catch (error) {
    console.error('Error en saveOrUpdateUser:', error);
    throw new Error('Error al guardar o actualizar el usuario');
  }
};
