const getRoomByIdController = require('../../controllers/room/getRoomByIdController');

const getRoomById = async (req, res) => {
  try {
    const id = req.params.id;

    // Validación agregada
    if (!id) return res.status(400).json({ message: 'Room ID is required' });
    if (isNaN(Number(id))) return res.status(400).json({ message: 'Invalid room ID' });

    const room = await getRoomByIdController(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    console.log('Room sent to client:', room);
    res.status(200).json(room);
  } catch (error) {
    console.error('Error in getRoom handler:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = getRoomById;
