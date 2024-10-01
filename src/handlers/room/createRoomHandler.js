const roomCreateController = require('../../controllers/room/createRoomController');

const createRoomHandler = async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log para verificar los datos de la solicitud

    // Llama al controlador de creación de habitaciones con los datos de la solicitud
    const room = await roomCreateController(req.body);

    // Devuelve la respuesta exitosa con la habitación creada
    console.log('Habitación creada:', room); // Verificar la respuesta del controlador
    return res.status(201).json(room); // Siempre retorna para evitar ejecutar código adicional
  } catch (error) {
    // Maneja y registra el error
    if (error.message === 'Room with this ID already exists') {
      return res.status(400).json({ error: error.message }); // Respuesta clara al cliente
    }

    console.error('Error al manejar la solicitud:', error); // Log para el servidor
    return res.status(500).send('Error al manejar la solicitud'); // Asegura que siempre retornas una respuesta
  }
};

module.exports = createRoomHandler;
