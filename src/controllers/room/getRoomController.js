const { Room } = require('../../models');

const getRoomController = async () => {
  try {
    const rooms = await Room.findAll();
    console.log('Rooms retrieved:', rooms); // Agregar log para verificar las habitaciones recuperadas
    return rooms;
  } catch (error) {
    console.error('Error fetching rooms:', error); // Agregar log para errores
    throw error;
  }
}

module.exports = getRoomController;
