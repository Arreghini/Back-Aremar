const { Room } = require('../../models');

const deleteRoomController = async (id) => {
  if (!id) {
    return null;
  }

  try {
    const rooms = await Room.findAll({ where: { id } });

    if (!rooms || rooms.length === 0) {
      return null;
    }

    const deletedCount = await Room.destroy({ where: { id } });

    if (deletedCount === 0) {
      return null;
    }

    return rooms;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};


module.exports = deleteRoomController;
