const path = require('path');
const fs = require('fs/promises');

const uploadImageController = async (file) => {
  // ✅ Validar buffer
  if (!file || !file.buffer) {
    throw new Error('Archivo no válido o buffer faltante');
  }

  // ✅ Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Unsupported file type');
  }

  // ✅ Validar path
  if (!file.path || file.path.trim() === '') {
    throw new Error('Invalid file path');
  }

  console.log('Subiendo archivo:', file.originalname);

  // Simular subida (ejemplo)
  const fileName = `${Date.now()}-${file.originalname}`;
  const uploadPath = path.join(__dirname, '../../../uploads', fileName);

  await fs.writeFile(uploadPath, file.buffer);

  return {
    url: `/uploads/${fileName}`,
    fileName,
  };
};

module.exports = { uploadImageController };
