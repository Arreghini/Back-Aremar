const { User } = require('../models'); 

exports.saveOrUpdateUser = async ({ id, name, email, emailVerified, picture, phone, dni, address, isActive }) => {
  try {
    // Validar que se proporciona un ID
    if (!id) {
      throw new Error('El ID del usuario es obligatorio');
    }

    // Intentar encontrar o crear el usuario
    let [user, created] = await User.findOrCreate({
      where: { id },
      defaults: { 
        email, 
        name, 
        picture, 
        email_verified: emailVerified, 
        phone,
        dni,
        address,
        isActive,
      },
    });

    // Si el usuario ya existe, actualiza sus datos
    if (!created) {
      user = await user.update({ 
        email, 
        name, 
        picture, 
        email_verified: emailVerified, // También aquí
        phone,
        dni,
        address,
        isActive,
      });
    }

    return user;
  } catch (error) {
    console.error('Error en saveOrUpdateUser:', error);
    throw new Error('Error al guardar o actualizar el usuario');
  }
};
