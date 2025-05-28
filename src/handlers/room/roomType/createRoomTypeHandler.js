const uploadImageController = require('../../../controllers/image/uploadImageController');
const { createRoomTypeController } = require('../../../controllers/room/roomType/createRoomTypeController');

const createRoomTypeHandler = async (req, res) => {
  try {
    console.log('=== DEBUG CREAR ROOM TYPE ===');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    
    // ✅ Extraer datos del formulario
    const { name, simpleBeds, trundleBeds, kingBeds, windows, price, existingPhotos } = req.body;
    
    console.log('Datos extraídos:');
    console.log('- name:', name);
    console.log('- simpleBeds:', simpleBeds);
    console.log('- price:', price);
    console.log('- existingPhotos:', existingPhotos);
    
    // Validación
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El nombre del tipo de habitación es requerido'
      });
    }
    
    // ✅ Procesar fotos existentes
    let photoUrls = [];
    if (existingPhotos) {
      try {
        photoUrls = JSON.parse(existingPhotos);
      } catch (e) {
        console.log('Error parseando existingPhotos:', e);
        photoUrls = [];
      }
    }
    
    // ✅ Subir nuevas imágenes si existen
    if (req.files && req.files.length > 0) {
      console.log(`Subiendo ${req.files.length} imágenes a Cloudinary...`);
      
      const uploadPromises = req.files.map(file => 
        uploadImageController(file, 'aremar/roomtypes')
      );
      
      const uploadResults = await Promise.all(uploadPromises);
      const newPhotoUrls = uploadResults.map(result => result.secure_url);
      photoUrls = [...photoUrls, ...newPhotoUrls];
    }
    
    // ✅ Crear objeto con todos los datos
    const roomTypeData = {
      name: name.trim(),
      simpleBeds: parseInt(simpleBeds) || 0,
      trundleBeds: parseInt(trundleBeds) || 0,
      kingBeds: parseInt(kingBeds) || 0,
      windows: parseInt(windows) || 0,
      price: parseFloat(price) || 0,
      photos: photoUrls
    };
    
    console.log('roomTypeData final:', roomTypeData);
    
    const newRoomType = await createRoomTypeController(roomTypeData);
    
    res.status(201).json({
      success: true,
      data: newRoomType,
      message: 'Tipo de habitación creado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al crear roomType:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al crear el tipo de habitación',
      details: error.message
    });
  }
};

module.exports = createRoomTypeHandler;
