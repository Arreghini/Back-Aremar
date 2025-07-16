const cloudinary = require('../../utils/cloudinary');

const deleteImageController = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    // Validar formato simple del publicId (ejemplo: no debe tener espacios)
    if (typeof publicId !== 'string' || /\s/.test(publicId)) {
      return res.status(400).json({ error: 'Invalid public ID format' });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'not found') {
      return res.status(404).json({ error: 'Image not found' });
    }

    return res.status(200).json({ message: 'Image deleted successfully' });

  } catch (error) {
    console.error('Error deleting image:', error);

    // Ejemplo manejo de errores según propiedades comunes en errores HTTP
    if (error.http_code === 401) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
    if (error.http_code === 504) {
      return res.status(504).json({ error: 'Request timeout' });
    }

    return res.status(500).json({ error: 'Error deleting image' });
  }
};

module.exports = deleteImageController;
