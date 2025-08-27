const getRoomByIdController = require('../../controllers/room/getRoomByIdController');

const getRoomByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (typeof id === 'undefined') {
      return res.status(400).json({ message: 'Room ID is required' });
    }

    if (typeof id !== 'string' || id.trim() === '') {
  return res.status(400).json({ message: 'Invalid room ID' });
}

    const room = await getRoomByIdController(id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(room);
  } catch (error) {
    if (error.message === 'Database error') {
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = getRoomByIdHandler;
