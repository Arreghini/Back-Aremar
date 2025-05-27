const uploadImageController = require('../../controllers/image/uploadImageController');

// Handler para múltiples imágenes
const uploadMultipleImagesHandler = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se enviaron archivos' });
    }

    const folder = req.body.folder || 'aremar/roomtypes';
    
    // Usa el mismo controlador para cada imagen
    const uploadPromises = req.files.map(file => 
      uploadImageController(file, folder)
    );
    
    const results = await Promise.all(uploadPromises);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al subir imágenes:', error);
    res.status(500).json({ error: 'Error al subir las imágenes' });
  }
};

// Handler para una sola imagen
const uploadSingleImageHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió archivo' });
    }

    const folder = req.body.folder || 'aremar/roomtypes';
    
    // Usa el mismo controlador
    const result = await uploadImageController(req.file, folder);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
};

module.exports = { 
  uploadMultipleImagesHandler, 
  uploadSingleImageHandler 
};
