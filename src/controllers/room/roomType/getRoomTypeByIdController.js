const { RoomType, Room } = require('../../../models');

const getRoomTypeByIdController = async (id) => {
  try {
    if (!id || typeof id !== 'string' || !id.trim()) {
      throw new Error('Room Type ID is required');
    }

    const roomType = await RoomType.findByPk(id.trim(), {
      include: Room,
    });

    return roomType;
  } catch (error) {
    console.error('Error al obtener tipo de habitación:', error.message);
    throw new Error(error.message || 'Unexpected error');
  }
};

module.exports = getRoomTypeByIdController;
