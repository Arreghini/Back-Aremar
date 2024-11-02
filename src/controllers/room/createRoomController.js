const { Room } = require('../../models');

const createRoomController = async (data) => {
  try {
    const {
      id,
      description,
      roomType,
      detailRoom,
      price,
      photoRoom,
      status,
    } = data;

    const newRoom = await Room.create({
      id,
      description,
      roomType,
      detailRoom,
      price,
      photoRoom,
      status,
    });
    
    return newRoom; // Retorna la nueva habitación creada
  } catch (error) {
    console.error('Error al crear la habitación:', error); // Muestra el error completo
    throw error; // Lanza el error para que sea manejado en el handler
  }
};

module.exports = createRoomController;
