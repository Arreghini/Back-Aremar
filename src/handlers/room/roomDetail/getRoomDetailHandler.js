
const getDetailController = require('../../../controllers/room/roomDetail/getRoomDetailController');

const getDetailHandler = async (req, res) => {
  try {
    const roomDetails = await getDetailController(); 

    return res.status(200).json(roomDetails); 
  } catch (error) {
    console.error('Error inesperado al manejar la solicitud:', error); 
    return res.status(500).send('Error al manejar la solicitud');
  }
};

module.exports = getDetailHandler;
