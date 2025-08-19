const deleteRoomController = require('../../controllers/room/deleteRoomController');

const deleteRoomHandler = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return res.status(400).json({ message: 'Missing or invalid room id' });
    }

    // Intentar eliminar la habitación
    const room = await deleteRoomController(id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ message: 'Room deleted successfully' });

  } catch (error) {
    console.error('Error in deleteRoom handler:', error);

    // Manejar errores de FK (dependencias)
    if (
      error.name === 'SequelizeForeignKeyConstraintError' ||
      error.message.includes('foreign key constraint')
    ) {
      return res.status(400).json({
        message:
          'Cannot delete room: it has related reservations or other dependencies',
      });
    }

    res.status(500).json({ message: error.message });
  }
};

module.exports = deleteRoomHandler;
