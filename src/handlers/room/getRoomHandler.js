const getRoomController = require('../../controllers/room/getRoomController');

const getRoom = async (req, res) => {
  try {
    const rooms = await getRoomController();
    console.log('Rooms sent to client:', rooms); 
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error in getRoom handler:', error); 
    res.status(500).json({ message: error.message });
  }
}

module.exports = getRoom;
