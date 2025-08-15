const { RoomDetail } = require('../../../models');

const getAllRoomDetailsController = async () => {
  try {
    const roomDetails = await RoomDetail.findAll();
    return roomDetails;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = getAllRoomDetailsController;
