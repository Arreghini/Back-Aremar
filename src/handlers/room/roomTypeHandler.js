
const roomTypeController = require('../../controllers/room/roomTypeController');

const roomTypeHandler = async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log para verificar los datos de la solicitud

    const roomTypes = await roomTypeController(req.body); 

    return res.status(201).json(roomTypes); 
  } catch (error) {
    // Si el error es por un ID duplicado, devolver un 400 sin loguear como error grave
    if (error.message === 'RoomType with this ID already exists') {
      return res.status(400).json({ error: error.message });
    }

    // Registrar solo errores inesperados
    console.error('Error inesperado al manejar la solicitud:', error); 
    return res.status(500).send('Error al manejar la solicitud');
  }
};

module.exports = roomTypeHandler;
