const cloudinary = require('../../utils/cloudinary');

// Controlador para UNA imagen usando buffer (memoryStorage)
const uploadImageController = async (file, folder) => {
  try {
    // ✅ Verificar que el archivo y buffer existan
    if (!file || !file.buffer) {
      throw new Error('Archivo no válido o buffer faltante');
    }

    console.log('Subiendo archivo:', file.originalname);
    console.log('Tamaño del buffer:', file.buffer.length);

    // ✅ Usar upload_stream para buffers
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          // Opcional: usar el nombre original del archivo
          public_id: file.originalname.split('.')[0] + '_' + Date.now(),
        },
        (error, result) => {
          if (error) {
            console.error('Error de Cloudinary:', error);
            reject(error);
          } else {
            console.log('Imagen subida exitosamente:', result.secure_url);
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              folder: folder,
            });
          }
        }
      );

      // ✅ Enviar el buffer al stream
      stream.end(file.buffer);
    });
  } catch (error) {
    console.error('Error en uploadImageController:', error);
    throw error;
  }
};

module.exports = uploadImageController;
