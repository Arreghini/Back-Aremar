const cloudinary = require('../../utils/cloudinary');

// Controlador para UNA imagen
const uploadImageController = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'image'
    });
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      folder: folder
    };
  } catch (error) {
    console.error('Error en uploadImageController:', error);
    throw error;
  }
};

module.exports = uploadImageController;
