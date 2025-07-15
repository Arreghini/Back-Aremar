const updateRoomController = require('../../controllers/room/updateRoomController');
const uploadImageController = require('../../controllers/image/uploadImageController');
const { Room } = require('../../models');

const updateRoomHandler = async (req, res) => {
  const { id } = req.params;
  let roomData = req.body;

  try {
    // Obtener la habitación actual
    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // 1. Leer fotos existentes del body (si vienen)
    let existingPhotos = [];

    if (roomData.existingPhotos) {
      try {
        existingPhotos =
          typeof roomData.existingPhotos === 'string'
            ? JSON.parse(roomData.existingPhotos)
            : roomData.existingPhotos;
      } catch (e) {
        existingPhotos = [];
      }
    } else {
      existingPhotos = room.photoRoom || [];
    }

    // 2. Subir nuevas fotos si existen
    let newPhotoRoom = [];
    console.log('Archivos recibidos (req.files):', req.files);

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadImageController(file, 'aremar/rooms')
      );
      const uploadResults = await Promise.all(uploadPromises);
      newPhotoRoom = uploadResults.map((result) => result.secure_url);
    }

    // 3. Combinar fotos existentes y nuevas
    // Si no hay fotos nuevas ni existentes, mantén las actuales de la BD
    if (existingPhotos.length > 0 || newPhotoRoom.length > 0) {
      roomData.photoRoom = [...existingPhotos, ...newPhotoRoom];
    } else {
      roomData.photoRoom = room.photoRoom || [];
    }

    // Si no hay ninguna foto, elimina el campo para no sobrescribir con vacío
    if (!roomData.photoRoom || roomData.photoRoom.length === 0) {
      delete roomData.photoRoom;
    }

    // Manejo robusto del precio
   if (roomData.price !== undefined && roomData.price !== '') {
  const parsedPrice = parseFloat(roomData.price);
  if (!isNaN(parsedPrice)) {
    roomData.price = parsedPrice;
  } else {
    return res.status(400).json({
      message: 'El precio es obligatorio y debe ser un número válido.'
    });
  }
} else {
  return res.status(400).json({
    message: 'El precio es obligatorio y debe ser un número válido.'
  });
}

    // Validación final de price
    if (
      roomData.price === undefined ||
      roomData.price === null ||
      isNaN(roomData.price)
    ) {
      return res
        .status(400)
        .json({
          message: 'El precio es obligatorio y debe ser un número válido.',
        });
    }

    const updatedRoom = await updateRoomController(id, roomData);
    res.status(200).json(updatedRoom);
  } catch (error) {
    console.error('Error in updateRoom handler:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = updateRoomHandler;
