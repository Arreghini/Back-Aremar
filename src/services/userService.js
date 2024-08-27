
const { User } = require('../models'); 

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
