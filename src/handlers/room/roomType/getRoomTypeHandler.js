const getRoomTypeController = require('../../../controllers/room/roomType/getRoomTypeController');

const getRoomTypeHandler = async (req, res) => {
  try {
    const roomTypes = await getRoomTypeController();

    const response = {
      success: true,
      data: roomTypes,
      message: 'Tipos de habitación obtenidos exitosamente',
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error inesperado al manejar la solicitud:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener los tipos de habitación',
      details: error.message,
    });
  }
};

module.exports = getRoomTypeHandler;
