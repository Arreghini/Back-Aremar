const { RoomType } = require('../../../models');

const getTypesController = async () => {
  try {
    // Obtener todos los tipos de habitación
    const roomType = await RoomType.findAll();

    return roomType; // Retornar todos los tipos encontrados
  } catch (error) {
    console.error('Error al obtener los tipos de habitación:', error); 
    throw error; // Lanza el error para que sea manejado en el handler
  }
};

module.exports = getTypesController;
