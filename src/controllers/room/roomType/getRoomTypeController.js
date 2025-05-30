const { RoomType } = require('../../../models');

const getRoomTypeController = async () => {
  try {
    // Obtener todos los tipos de habitación
    const roomTypes = await RoomType.findAll();
    
    console.log('=== DEBUG GET ROOM TYPES CONTROLLER ===');
    console.log('Cantidad de tipos encontrados:', roomTypes.length);
    console.log('Tipo de datos devuelto:', typeof roomTypes);
    console.log('Es array?:', Array.isArray(roomTypes));
    console.log('Datos completos:', JSON.stringify(roomTypes, null, 2));
    
    return roomTypes;
  } catch (error) {
    console.error('Error al obtener los tipos de habitación:', error); 
    throw error; // Lanza el error para que sea manejado en el handler
  }
};

module.exports = getRoomTypeController;
