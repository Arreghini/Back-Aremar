const getRoomTypeController = require('../../../controllers/room/roomType/getRoomTypeController');

const getRoomTypeHandler = async (req, res) => {
  try {
    console.log('=== GET ROOM TYPES HANDLER ===');

    const roomTypes = await getRoomTypeController();

    console.log('=== ANTES DE ENVIAR RESPUESTA ===');
    console.log('roomTypes recibido del controller:', typeof roomTypes);
    console.log('Es array?:', Array.isArray(roomTypes));
    console.log('Cantidad:', roomTypes ? roomTypes.length : 'undefined');
    console.log('Datos:', roomTypes);

    const response = {
      success: true,
      data: roomTypes,
      message: 'Tipos de habitación obtenidos exitosamente',
    };

    console.log('Respuesta que se enviará:', JSON.stringify(response, null, 2));

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
