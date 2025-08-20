const createRoomController = require('../../controllers/room/createRoomController');

const CreateRoomHandler = async (req, res) => {
  try {
    console.log('Body recibido:', req.body);
    console.log('Archivos recibidos:', req.files);

    const { id, price, capacity, description, roomTypeId, status, detailRoomId } = req.body;

    // Validar existencia de campos requeridos
    if (
      id === undefined ||
      price === undefined ||
      capacity === undefined ||
      description === undefined ||
      roomTypeId === undefined
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Convertimos después de validar existencia
    const numericPrice = Number(price);
    const numericCapacity = Number(capacity);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: 'Price must be positive' });
    }

    if (isNaN(numericCapacity) || numericCapacity <= 0) {
      return res.status(400).json({ message: 'Capacity must be positive' });
    }

    const newRoom = await createRoomController({
      id,
      price: numericPrice,
      capacity: numericCapacity,
      description,
      roomTypeId,
      status,
      detailRoomId
    });

    if (!newRoom) {
      return res.status(400).json({ message: 'Room already exists' });
    }

    return res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error in CreateRoomHandler:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = CreateRoomHandler;
