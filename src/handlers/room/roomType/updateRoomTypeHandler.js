const updateRoomTypeController = require('../../../controllers/room/roomType/updateRoomTypeController');

const updateRoomTypeHandler = async (req, res) => {
  try {
    console.log('=== DEBUG UPDATE HANDLER ===');
    console.log('req.params:', req.params);
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    
    const { id } = req.params;
    let updateData = req.body;

    console.log('ID extraído:', id);
    console.log('Datos de actualización:', updateData);

    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'ID del tipo de habitación es requerido' 
      });
    }

    // ✅ Manejar archivos si existen
    if (req.files && req.files.length > 0) {
      // Si hay archivos nuevos, procesarlos
      const uploadImageController = require('../../../controllers/image/uploadImageController');
      
      const uploadPromises = req.files.map(file => 
        uploadImageController(file, 'aremar/roomtypes')
      );
      
      const uploadResults = await Promise.all(uploadPromises);
      const newPhotoUrls = uploadResults.map(result => result.secure_url);
      
      // Combinar fotos existentes con nuevas
      let existingPhotos = [];
      if (updateData.existingPhotos) {
        try {
          existingPhotos = JSON.parse(updateData.existingPhotos);
        } catch (e) {
          console.log('Error parsing existingPhotos:', e);
        }
      }
      
      updateData.photos = [...existingPhotos, ...newPhotoUrls];
    }

    const updatedType = await updateRoomTypeController(id, updateData);

    if (!updatedType) {
      return res.status(404).json({ 
        success: false,
        error: 'RoomType no encontrado' 
      });
    }

    return res.status(200).json({ 
      success: true,
      message: 'RoomType actualizado con éxito', 
      data: updatedType 
    });
    
  } catch (error) {
    console.error('Error al actualizar el tipo de habitación:', error);
    
    if (error.message === 'RoomType no encontrado') {
      return res.status(404).json({
        success: false,
        error: 'El tipo de habitación no existe'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

module.exports = updateRoomTypeHandler;
