const { Room, RoomType } = require('../../../models');

const getRoomTypeByRoomIdController = async (roomId) => {
  try {
    if (!roomId || typeof roomId !== 'string' || !roomId.trim()) {
      throw new Error('Room ID is required');
    }

    const room = await Room.findOne({
      where: { id: roomId.trim() },
      include: [
        {
          model: RoomType,
          as: 'roomType', // o el alias que hayas definido en la asociación
        },
      ],
    });

    if (!room) {
      return null; // habitación no encontrada
    }

    return room.roomType; // devuelve el tipo de habitación
  } catch (error) {
    console.error('Error al obtener tipo de habitación por roomId:', error.message);
    throw new Error(error.message || 'Unexpected error');
  }
};

module.exports = getRoomTypeByRoomIdController;
