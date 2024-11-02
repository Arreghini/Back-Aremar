const { RoomDetail } = require('../../models');

const roomTypeController = async (data) => {
  try {
    const {
      id,
      cableTvService,
      smart_TV,
      wifi,
      microwave,
    } = data;

    const roomDetail = await RoomDetail.create({
      id,
      cableTvService,
      smart_TV,
      wifi,
      microwave,
    });
    
    return roomDetail; 
  } catch (error) {
    console.error('Error al crear la habitación:', error); // Muestra el error completo
    throw error; // Lanza el error para que sea manejado en el handler
  }
};

module.exports = roomTypeController;
