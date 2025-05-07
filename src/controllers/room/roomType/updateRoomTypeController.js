const { RoomType } = require('../../../models');

const updateRoomTypeController = async (roomTypeId, data) => {
  try {
    // Buscar el tipo de habitación por ID
    const roomType = await RoomType.findByPk(roomTypeId);
    
    // Si no se encuentra, lanzar un error
    if (!roomType) {
      throw new Error('RoomType no encontrado');
    }

    // Actualizar los campos del tipo de habitación con los nuevos datos
    await roomType.update(data);

    return roomType; // Retornar el tipo de habitación actualizado
  } catch (error) {
    console.error('Error al actualizar el tipo de habitación:', error); 
    throw error; // Lanza el error para que sea manejado en el handler
  }
};

module.exports = updateRoomTypeController;
