// controllers/room/roomDetail/deleteRoomDetailController.js
const { RoomDetail } = require('../../../models');

const deleteDetailController = async (id) => {
  if (!id) throw new Error('Invalid room detail ID');

  try {
    const detailToDelete = await RoomDetail.findByPk(id);

    if (!detailToDelete) {
      throw new Error('RoomDetail no encontrado');
    }

    await detailToDelete.destroy(); // Usamos el método de instancia para facilitar el test

    return detailToDelete;
  } catch (error) {
    console.error('Error al eliminar el detalle de la habitación:', error);
    throw error;
  }
};

module.exports = deleteDetailController;
