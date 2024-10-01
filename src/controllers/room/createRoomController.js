const { Room } = require('../../models/index'); // Ajusta esta ruta si es necesario


const roomCreateController = async (roomData) => {
  console.log('body recibido en el controlador:', roomData);  // Para verificar que se está recibiendo el cuerpo de la solicitud
  try {
    const { id, description, typeRoom, detailRoom, price, photoRoom, status } = roomData;

    // Busca la habitación existente
    const existingRoom = await Room.findByPk(id); // Esto debe funcionar si Room está definido correctamente

    if (existingRoom) {
      throw new Error('Room with this ID already exists'); // Lanza un error para manejarlo en el handler
    }

    // Crea la nueva habitación
    const newRoom = await Room.create({
      id,
      description,
      typeRoom,
      detailRoom,
      price,
      photoRoom,
      status,
    });

    return newRoom; // Retorna la nueva habitación creada
  } catch (error) {
    console.error('Error al crear la habitación:', error);
    throw error; // Lanza el error para que sea manejado en el handler
  }
};

module.exports = roomCreateController;
