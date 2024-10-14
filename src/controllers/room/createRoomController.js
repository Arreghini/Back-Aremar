const { Room } = require('../../models/index'); // Ajusta esta ruta si es necesario

const roomCreateController = async (roomData) => {
  console.log('Datos recibidos en el controlador:', roomData);  // Verificación de datos de entrada
  try {
    const { id, description, typeRoom, detailRoom, price, photoRoom, status } = roomData;

    // Buscar habitación existente por ID
    const existingRoom = await Room.findByPk(id);

    // Si ya existe una habitación con el mismo ID, lanza un error controlado
    if (existingRoom) {
      throw new Error('Room with this ID already exists');
    }

    // Crear la nueva habitación
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
    console.error('Error al crear la habitación:', error.message); // Solo imprime el mensaje del error
    throw error; // Lanza el error para que sea manejado en el handler
  }
};

module.exports = roomCreateController;
