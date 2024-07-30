
const updateRoomController = require('../../controllers/room/updateRoomController');

const updateRoomHandler = async (req, res) => {
  const { id } = req.params; 
  const roomData = req.body; 

  try {
    const updatedRoom = await updateRoomController(id, roomData);
    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json(updatedRoom);
  } catch (error) {
    console.error('Error in updateRoom handler:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = updateRoomHandler;
