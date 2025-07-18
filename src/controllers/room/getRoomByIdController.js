const { Room, RoomType, RoomDetail } = require('../../models');

const getRoomByIdController = async (id) => {
  try {
    if (typeof id !== 'string' || !id.trim()) {
      throw new Error(typeof id !== 'string' ? 'Room ID must be a string' : 'Room ID is required');
    }

    const room = await Room.findByPk(id.trim(), {
      include: [
        {
          model: RoomType,
          as: 'roomType', // 🔑 ¡Alias obligatorio!
        },
        {
          model: RoomDetail,
          as: 'roomDetail', // 🔑 ¡Alias obligatorio!
        },
      ],
    });

    return room;
  } catch (error) {
    console.error('Error getting room by ID:', error.message);
    throw new Error(error.message || 'Unexpected error');
  }
};

module.exports = getRoomByIdController;
