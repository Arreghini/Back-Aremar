const { RoomType } = require('../../models');

const roomTypeController = async (data) => {
  try {
    const {
      id,
      name,
      photos,
      simpleBeds,
      trundleBeds,
      KingBeds,
      windows,
    } = data;

    const newType = await RoomType.create({
      id,
      name,
      photos,
      simpleBeds,
      trundleBeds,
      KingBeds,
      windows,
    });
    
    return newType; 
  } catch (error) {
    console.error('Error al crear la habitación:', error); // Muestra el error completo
    throw error; // Lanza el error para que sea manejado en el handler
  }
};

module.exports = roomTypeController;
