const { RoomType } = require('../../../models');

const getRoomTypeController = async () => {
  try {
    // Obtener todos los tipos de habitación
    const roomTypes = await RoomType.findAll();

    return roomTypes;
  } catch (error) {
    console.error('Error al obtener los tipos de habitación:', error);
    throw error; // Lanza el error para que sea manejado en el handler
  }
};

module.exports = getRoomTypeController;
