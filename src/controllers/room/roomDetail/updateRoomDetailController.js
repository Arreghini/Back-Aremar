const { RoomDetail } = require('../../../models');

const updateDetailController = async (id, data) => {
  try {
    // Buscar el detalle de habitación por ID
    const roomDetail = await RoomDetail.findByPk(id);
    
    // Si no se encuentra, lanzar un error
    if (!roomDetail) {
      throw new Error('RoomDetail no encontrado');
    }

    // Actualizar los campos del detalle de habitación con los nuevos datos
    await roomDetail.update(data);

    return roomDetail; // Retornar el detalle actualizado
  } catch (error) {
    console.error('Error al actualizar el detalle de la habitación:', error); 
    throw error; // Lanza el error para que sea manejado en el handler
  }
};

module.exports = updateDetailController;
