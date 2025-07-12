const createDetailController = require('../../../controllers/room/roomDetail/createRoomDetailController');

const createDetailHandler = async (req, res) => {
  try {
    const createTypes = await createDetailController(req.body);
    // console.log("Desde el frontend:", req.body);

    return res
      .status(201)
      .json({ message: 'RoomDetail creado con éxito', data: createTypes });
  } catch (error) {
    // Si el error es por un ID duplicado, devolver un 400
    if (error.message === 'RoomDetail con este ID ya existe') {
      return res.status(400).json({ error: error.message });
    }

    // Registrar solo errores inesperados
    console.error('Error inesperado al manejar la solicitud:', error);
    return res.status(500).send('Error al manejar la solicitud');
  }
};

module.exports = createDetailHandler;
