const cloudinary = require('../../utils/cloudinary');
const fs = require('fs');

const uploadImageController = async (file, folder = 'aremar/misc') => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder,
  });

  fs.unlinkSync(file.path); // Borra el archivo local temporal
  return result;
};

module.exports = uploadImageController;
