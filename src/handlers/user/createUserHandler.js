const { v4: uuidv4 } = require('uuid'); // Importa la función para generar UUID
const userCreateController = require('../../controllers/user/createUserController');

const createUserHandler = async (req, res) => {
  try {
    console.log('Request Body:', req.body);

    // Verificar si el ID está presente y no es nulo
    if (!req.body.id) {
      req.body.id = uuidv4(); // Genera un nuevo UUID
    }

    // Llama al controlador de creación de usuarios con los datos de la solicitud
    const user = await userCreateController(req.body);

    // Devuelve la respuesta exitosa con el usuario creado
    console.log('Usuario creado:', user);
    return res.status(201).json({
      message: 'Cliente creado exitosamente', // Mensaje personalizado
      user, // Incluye los detalles del usuario creado
    });
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

module.exports = createUserHandler;
