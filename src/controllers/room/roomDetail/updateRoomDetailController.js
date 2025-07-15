const { RoomDetail } = require('../../../models');

const updateRoomDetailController = async (id, updateData) => {
  if (
    id === null ||
    id === undefined ||
    (typeof id === 'string' && id.trim() === '') ||
    (typeof id !== 'string' && typeof id !== 'number')
  ) {
    throw new Error('Invalid room ID');
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    return true;
  }

  try {
    const roomDetail = await RoomDetail.findOne({ where: { id } });

    if (!roomDetail) {
      throw new Error('Room detail not found');
    }

    await roomDetail.update(updateData);

    return true;
  } catch (error) {
    if (
      error.message === 'Room detail not found' ||
      error.message === 'Invalid room ID'
    ) {
      throw error;
    }
    throw new Error('Database connection failed');
  }
};

module.exports = updateRoomDetailController;
