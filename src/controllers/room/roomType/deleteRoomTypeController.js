const { RoomType } = require('../../../models');

const deleteTypeController = async (id) => {
  try {
    // Buscar el tipo de habitación por ID
    const typeToDelete = await RoomType.findByPk(id);
    
    if (!typeToDelete) {
      throw new Error('RoomType no encontrado'); // Lanza un error si no se encuentra el tipo
    }

    // Eliminar el tipo de habitación
    await RoomType.destroy({
      where: { id }
    });
    
    return typeToDelete; // Retorna el tipo que fue eliminado
  } catch (error) {
    console.error('Error al eliminar el tipo de habitación:', error); 
    throw error; 
  }
};

module.exports = deleteTypeController;
