const uploadImageController = require('../../controllers/image/imageUploadController');

const uploadImageHandler = async (req, res) => {
  try {
    const folder = req.body.folder || 'aremar/misc';
    const result = await uploadImageController(req.file, folder);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
};

module.exports = uploadImageHandler;
