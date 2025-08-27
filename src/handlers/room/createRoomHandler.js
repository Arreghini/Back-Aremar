const createRoomController = require('../../controllers/room/createRoomController');

const createRoomHandler = async (req, res) => {
  try {
    const { id, price, capacity, description } = req.body || {};

    // Validar campos requeridos
    if (
      typeof id === 'undefined' ||
      typeof price === 'undefined' ||
      typeof capacity === 'undefined' ||
      typeof description === 'undefined'
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const numericPrice = Number(price);
    const numericCapacity = Number(capacity);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: 'Price must be positive' });
    }

    if (isNaN(numericCapacity) || numericCapacity <= 0) {
      return res.status(400).json({ message: 'Capacity must be positive' });
    }

    // Llamar al controller con req.body completo (el test espera eso)
    const newRoom = await createRoomController(req.body);

    return res.status(201).json(newRoom);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = createRoomHandler;
