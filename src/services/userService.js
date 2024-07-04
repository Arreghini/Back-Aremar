const { User } = require('../models');

exports.saveOrUpdateUser = async ({ user_id, email, name, picture }) => {
  const [user, created] = await User.upsert({
    id: user_id,  // Utiliza user_id de Auth0 como el id en la base de datos
    name,     // Auth0 puede proporcionar name o nickname, que puedes asignar a username
    email,
    picture,      
    isActive: true, 
  }, {
    returning: true
  });

  return user;
};
