const userCreateController = require('../../controllers/user/createUserController');

const createUserHandler = async (req, res) => {
  try {
    console.log('Request Body:', req.body);

    // Llama al controlador de creación de habitaciones con los datos de la solicitud
    const user = await userCreateController(req.body);

    // Devuelve la respuesta exitosa con el usuario creado
    console.log('Usuario creada:', user); 
    return res.status(201).json(user); 
  } catch (error) {
    // Si el error es por un ID duplicado, devolver un 400 sin loguear como error grave
    if (error.message === 'User with this ID already exists') {
      return res.status(400).json({ error: error.message });
    }

    // Registrar solo errores inesperados
    console.error('Error inesperado al manejar la solicitud:', error); 
    return res.status(500).send('Error al manejar la solicitud');
  }
};

module.exports = userCreateController;