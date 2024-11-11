const createTypeController = require('../../../controllers/room/roomType/createRoomTypeController');

const createTypeHandler = async (req, res) => {
  try {
    //console.log('Datos recibidos para crear el tipo de habitación:', req.body);
    const newRoomType = await createTypeController(req.body);

    return res.status(201).json({ message: 'RoomType creado con éxito', data: newRoomType });
  } catch (error) {
    // Si el error es por un ID duplicado, devolver un 400
    if (error.message === 'RoomType con este ID ya existe') {
      return res.status(400).json({ error: error.message });
    }

    // Registrar solo errores inesperados
    console.error('Error inesperado al manejar la solicitud:', error); 
    return res.status(500).send('Error al manejar la solicitud');
  }
};

module.exports = createTypeHandler;
