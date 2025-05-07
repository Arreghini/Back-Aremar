const getRoomTypeController = require('../../../controllers/room/roomType/getRoomTypeController');

const getRoomTypeHandler = async (req, res) => {
  try {
    const roomTypes = await getRoomTypeController(); 

    return res.status(200).json(roomTypes); 
  } catch (error) {
    console.error('Error inesperado al manejar la solicitud:', error); 
    return res.status(500).send('Error al manejar la solicitud');
  }
};

module.exports = getRoomTypeHandler;
