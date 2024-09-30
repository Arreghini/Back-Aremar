const Room = require('../../models/Room'); // Ajusta esta ruta si es necesario

const roomCreateController = async (req, res) => {
  console.log('body recibido en el controlador:',req.body);  // Para verificar que se está recibiendo el cuerpo de la solicitud
  try {
    const { id, description, typeRoom, detailRoom, price, photoRoom, status } = req.body;

    // Busca la habitación existente
    const existingRoom = await Room.findByPk(id); // Esto debe funcionar si Room está definido correctamente

    if (existingRoom) {
      return res.status(400).json({ message: 'La habitación ya existe.' });
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

    return res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error al crear la habitación:', error);
    return res.status(500).json({ message: 'Error al crear la habitación.' });
  }
};

module.exports = roomCreateController;
