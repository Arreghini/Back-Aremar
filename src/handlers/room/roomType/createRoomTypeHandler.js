const uploadImageController = require('../../../controllers/image/uploadImageController');
const createRoomTypeController = require('../../../controllers/roomType/createRoomTypeController');

const createRoomTypeHandler = async (req, res) => {
  try {
    const { name, simpleBeds, trundleBeds, kingBeds, windows, price } = req.body;
    
    // Subir imágenes a Cloudinary si existen
    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      console.log(`Subiendo ${req.files.length} imágenes a Cloudinary...`);
      
      const uploadPromises = req.files.map(file => 
        uploadImageController(file, 'aremar/roomtypes')
      );
      
      const uploadResults = await Promise.all(uploadPromises);
      photoUrls = uploadResults.map(result => result.secure_url);
    }
    
    // Crear roomType con las URLs
    const roomTypeData = {
      name,
      simpleBeds: parseInt(simpleBeds) || 0,
      trundleBeds: parseInt(trundleBeds) || 0,
      kingBeds: parseInt(kingBeds) || 0,
      windows: parseInt(windows) || 0,
      price: parseFloat(price) || 0,
      photos: photoUrls
    };
    
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
