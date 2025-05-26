const deleteImageController = require('../../controllers/image/imageDeleteController');

const deleteImageHandler = async (req, res) => {
    try {
        const result = await deleteImageController(req.body.public_id);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al eliminar la imagen:', error);
        res.status(500).json({ error: 'Error al eliminar la imagen' });
    }
};

module.exports = deleteImageHandler;