
const { Room } = require('../../models'); 

const updateRoomController = async (id, roomData) => {
  try {
    const room = await Room.findAll(
      { where: { id } }
    );

    if (!room) {
      return null;
    }

    // Validar que `photoRoom` es un array antes de actualizar
    if (roomData.photoRoom && !Array.isArray(roomData.photoRoom)) {
      console.error('photoRoom debe ser un array.');
      throw new Error('photoRoom debe ser un array.');
    }

    const updatedRoom = await room.update(roomData);
    return updatedRoom;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};


module.exports = updateRoomController;
