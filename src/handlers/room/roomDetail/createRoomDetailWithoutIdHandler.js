const createDetailController = require('../../../controllers/room/roomDetail/createRoomDetailController');

const createRoomDetailWithoutIdHandler = async (req, res) => {
  try {
    // Validate that we have data to create
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Datos de entrada inválidos' });
    }

    const createTypes = await createDetailController(req.body);
    
    return res
      .status(201)
      .json({ success: true, data: createTypes });
  } catch (error) {
    // Si el error es por un ID duplicado, devolver un 400
    if (error.message === 'RoomDetail con este ID ya existe') {
      return res.status(400).json({ error: error.message });
    }

    // Registrar solo errores inesperados
    console.error('Error inesperado al manejar la solicitud:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = createRoomDetailWithoutIdHandler;
