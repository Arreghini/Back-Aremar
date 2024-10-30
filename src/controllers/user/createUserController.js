const { User } = require('../../models/index'); 

const userCreateController = async (roomData) => {
  console.log('Datos recibidos en el controlador:', roomData);  // Verificación de datos de entrada
  try {
    const { id, name, email, verifyedEmail, picture, phone, dni, address, isActive  } = roomData;

    // Buscar usuario existente por ID
    const existingUser = await User.findByPk(id);

    // Si ya existe un usuario con el mismo ID, lanza un error controlado
    if (existingUser) {
      throw new Error('User with this ID already exists');
    }

    // Crear el nuevo usuario
    const newUser = await User.create({
      id,
      name,
      email,
      verifyedEmail,
      picture,
      phone,
      dni,
      address,
      isActive,
      });

    return newUser; 
  } catch (error) {
    console.error('Error al crear el usuario:', error.message); 
    throw error; 
  }
};

module.exports = userCreateController;