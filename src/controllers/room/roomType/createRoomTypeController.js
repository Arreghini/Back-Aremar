const { RoomType, Room } = require('../../../models');

const createTypeController = async (data) => {
  try {
    const {
      id,
      name,
      photos,
      simpleBeds,
      trundleBeds,
      kingBeds, 
      windows,
      price, 
    } = data;

    const newType = await RoomType.create({
      id,
      name,
      photos,
      simpleBeds,
      trundleBeds,
      kingBeds,
      windows,
      price, 
    });

    return newType; 
  } catch (error) {
    console.error('Error al crear el tipo de habitación:', error); 
    throw error; 
  }
};

const createRoomController = async (data) => {
  try {
    const { id, description, roomTypeId, photoRoom, price, status } = data;

    // Verificar si el ID ya existe
    const existingRoom = await Room.findOne({ where: { id } });
    if (existingRoom) {
      throw new Error(`El ID de la habitación (${id}) ya existe.`);
    }

    // Crear la nueva habitación
    const newRoom = await Room.create({
      id,
      description,
      roomTypeId,
      photoRoom,
      price,
      status,
    });

    return newRoom;
  } catch (error) {
    console.error('Error al crear la habitación:', error.message);
    throw error;
  }
};

module.exports = { createTypeController, createRoomController };
