const cloudinary = require('../../utils/cloudinary');

const deleteImageController = async (id) => {
    const result = await cloudinary.uploader.destroy(id);
    return result;
};

module.exports = deleteImageController;
