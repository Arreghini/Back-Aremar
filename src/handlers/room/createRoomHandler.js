const CreateRoomController = require('../../controllers/room/createRoomController');
const uploadImageController = require('../../controllers/image/uploadImageController'); // Asegúrate de tener este import

const CreateRoomHandler = async (req, res) => {
    try {
      console.log('=== DEBUG HANDLER ===');
      console.log('Body recibido:', JSON.stringify(req.body, null, 2));
      console.log('Archivos recibidos:', req.files);

      // Verificar si los datos están presentes
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ 
          error: 'No se recibieron datos en el cuerpo de la solicitud'
        });
      }

      // Procesar fotos si existen
      let photoRoom = [];
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(file =>
          uploadImageController(file, 'aremar/rooms')
        );
        const uploadResults = await Promise.all(uploadPromises);
        photoRoom = uploadResults.map(result => result.secure_url);
      }

      // Pasar las URLs de las fotos al controlador
      const roomData = {
        ...req.body,
        photoRoom
      };

      // Llamar al controlador
      const room = await CreateRoomController(roomData);

      console.log('✅ Habitación creada exitosamente en handler');
    
      // Verificar si el ID cambió
      const originalId = req.body.id;
      const finalId = room.id;
      const idChanged = originalId && originalId !== finalId;

      return res.status(201).json({
        success: true,
        message: idChanged 
          ? `Habitación creada exitosamente. ID original '${originalId}' ya existía, se asignó '${finalId}'`
          : 'Habitación creada exitosamente',
        data: room,
        idChanged: idChanged,
        originalId: originalId,
        finalId: finalId
      });
    } catch (error) {
      console.error('❌ Error en handler:', error.message);
    
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
};

module.exports = CreateRoomHandler;