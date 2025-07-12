const { Room, RoomType } = require('../../../models');

const getRoomTypeByRoomIdController = async (roomId) => {
  try {
    console.log('[Controller] Buscando habitación con ID:', roomId);

    const room = await Room.findOne({
      where: { id: roomId },
      include: {
        model: RoomType,
        as: 'roomType',
        attributes: ['id', 'name', 'price'],
      },
    });

    if (!room) {
      console.warn('[Controller] No se encontró habitación con ID:', roomId);
      return null;
    }

    console.log('[Controller] Tipo de habitación encontrado:', room.roomType);
    return room.roomType;
  } catch (error) {
    console.error(
      '[Controller] Error al buscar tipo de habitación:',
      error.message
    );
    throw new Error('Error al obtener tipo de habitación');
  }
};

module.exports = getRoomTypeByRoomIdController;
