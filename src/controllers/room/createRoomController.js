const { Room } = require('../../models');

const createRoomController = async (data) => {
  try {
    const { id, description, roomTypeId, detailRoomId, price, photoRoom, status } = data;

    const newRoom = await Room.create({
      id,
      description,
      roomTypeId,      
      detailRoomId,    
      price,
      photoRoom,
      status,
    });

    return newRoom;
  } catch (error) {
    console.error('Error al crear la habitación:', error);
    throw error;
  }
};

module.exports = createRoomController;
