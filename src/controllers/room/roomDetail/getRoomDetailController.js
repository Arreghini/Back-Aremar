const { RoomDetail } = require('../../../models');

const getRoomDetailController = async (id) => {
  if (id === undefined || id === null) {
    throw new Error('Room detail ID must be provided');
  }

  if (typeof id !== 'string') {
    throw new Error('Room detail ID must be a string');
  }

  if (id.trim() === '') {
    throw new Error('Room detail ID cannot be empty');
  }

  try {
    const roomDetail = await RoomDetail.findByPk(id);
    return roomDetail;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = getRoomDetailController;
