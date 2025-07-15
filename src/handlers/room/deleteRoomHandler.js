const deleteRoomController = require('../../controllers/room/deleteRoomController');

const deleteRoomHandler = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Missing room id' });
    }

    if (isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid room ID format' });
    }

    const room = await deleteRoomController(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error in deleteRoom handler:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = deleteRoomHandler;
