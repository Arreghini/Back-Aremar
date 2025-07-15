const createRoomController = require('../../controllers/room/createRoomController');

const CreateRoomHandler = async (req, res) => {
  try {
    const { id, price, capacity, description } = req.body;

  if (
  id === undefined ||
  price === undefined ||
  capacity === undefined ||
  description === undefined
) {
  return res.status(400).json({ message: 'Missing required fields' });
}

    if (price <= 0) {
      return res.status(400).json({ message: 'Price must be positive' });
    }

    if (capacity <= 0) {
      return res.status(400).json({ message: 'Capacity must be positive' });;
    }

    const newRoom = await createRoomController(req.body);
    if (!newRoom) {
      return res.status(400).json({ message: 'Room already exists' });
    }
    return res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error in CreateRoomHandler:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = CreateRoomHandler;
