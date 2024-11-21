const { Room } = require('../../models');

const deleteRoomController = async (id) => {
  try {
    const room = await Room.findAll({ where: { id } });
    if (!room) {
      return null; // La habitación no fue encontrada
    }
    await Room.destroy({ where: { id } });
    return room;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};

module.exports = deleteRoomController;
