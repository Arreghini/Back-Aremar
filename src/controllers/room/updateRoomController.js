
const { Room } = require('../../models'); 

const updateRoomController = async (id, roomData) => {
  try {
    const room = await Room.findByPk(id); // Buscar la habitación por su ID
    if (!room) {
      return null; // Retornar null si no se encuentra la habitación
    }
    const updatedRoom = await room.update(roomData); // Actualizar la habitación con los datos proporcionados
    return updatedRoom;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

module.exports = updateRoomController;
