const roomCreateController = require('../../controllers/room/roomCreateController');

exports.handlerCreateRoom = async (req, res) => {
  try {
    console.log('Request Body:', req.body);

    // Llama al controlador de creación de habitaciones con los datos de la solicitud
    const room = await roomCreateController(req, res);

    // Devuelve la respuesta exitosa con la habitación creada
    res.status(201).json(room);
  } catch (error) {
    // Maneja y registra el error
    console.error('Error al manejar la solicitud:', error);
    res.status(500).send('Error al manejar la solicitud');
  }
};
