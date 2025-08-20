const getRoomByIdController = require('../../controllers/room/getRoomByIdController');

const getRoomByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Caso 1: ID faltante
    if (id === undefined) {
      return res.status(400).json({ message: 'Room ID is required' });
    }

    // Caso 2: ID inválido (string vacío o solo espacios)
    if (typeof id !== 'string' || id.trim() === '') {
      return res.status(400).json({ message: 'Invalid room ID' });
    }

    // Buscar en DB
    const room = await getRoomByIdController(id);

    // Si no existe la habitación, pero el ID es válido, devuelve 404
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error('Error in getRoomByIdHandler:', error);
    if (error.message === 'Database error') {
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = getRoomByIdHandler;
