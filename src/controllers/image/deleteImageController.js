const cloudinary = require('../../config/cloudinary');

const deleteImageController = async (id) => {
    const result = await cloudinary.uploader.destroy(id);
    return result;
};

module.exports = deleteImageController;
