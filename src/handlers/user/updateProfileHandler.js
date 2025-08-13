const updateUserController = require('../../controllers/user/updateUserController');

const updateUserHandler = async (req, res) => {
  // Acepta userId desde body o id desde params
  const userId = req.body.userId || req.params.id;
  const updateData = req.body;

  // 401 si no hay userId
  if (!userId) {
    return res.status(401).json({ message: 'User ID is required' });
  }

  // 400 si no hay datos para actualizar (solo viene el userId)
  if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length <= 1) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  // Validar que al menos un campo no esté vacío
  const hasValidFields = Object.entries(updateData).some(
    ([key, val]) => key !== 'userId' && val !== null && val !== undefined && val !== ''
  );

  if (!hasValidFields) {
    return res.status(400).json({ message: 'Update data cannot be empty' });
  }

  try {
    const updatedUser = await updateUserController(updateData);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || 'Update failed' });
  }
};

module.exports = updateUserHandler;
