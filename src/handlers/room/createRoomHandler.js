
const roomCreateController = require('../../controllers/room/createRoomController');

const createRoomHandler = async (req, res) => {
  try {
    console.log('Request Body:', req.body);

    // Llama al controlador de creación de habitaciones con los datos de la solicitud
    const room = await roomCreateController(req);

    // Devuelve la respuesta exitosa con la habitación creada
    res.status(201).json(room);
  } catch (error) {
    // Maneja y registra el error
    if (error.message === 'Room with this ID already exists') {
      return res.status(400).json({ error: error.message });
    }

    console.error('Error al manejar la solicitud:', error);
    res.status(500).send('Error al manejar la solicitud');
  }
};

module.exports = createRoomHandler;

