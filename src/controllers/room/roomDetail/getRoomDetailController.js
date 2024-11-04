const { RoomDetail } = require('../../models');

const getDetailsController = async () => {
  try {
    // Obtener todos los detalles de habitación
    const roomDetails = await RoomDetail.findAll();

    return roomDetails; // Retornar todos los detalles encontrados
  } catch (error) {
    console.error('Error al obtener los detalles de la habitación:', error); 
    throw error; // Lanza el error para que sea manejado en el handler
  }
};

module.exports = getDetailsController;
