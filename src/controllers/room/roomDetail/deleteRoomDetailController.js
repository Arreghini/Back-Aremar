const { RoomDetail } = require('../../../models');

const deleteDetailController = async (id) => {
  try {
    // Buscar el detalle de la habitación por ID
    const detailToDelete = await RoomDetail.findByPk(id);
    
    if (!detailToDelete) {
      throw new Error('RoomDetail no encontrado'); 
    }

    // Eliminar el detalle de la habitación
    await RoomDetail.destroy({
      where: { id }
    });
    
    return detailToDelete; // Retorna el detalle que fue eliminado
  } catch (error) {
    console.error('Error al eliminar el detalle de la habitación:', error); 
    throw error; 
  }
};

module.exports = deleteDetailController;
