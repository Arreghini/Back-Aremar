const updateUserController = require('../../controllers/user/updateUserController ');

const updateUserHandler = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  // Validar que el cuerpo exista y sea un objeto
  if (!updateData) {
    return res.status(400).json({ message: 'Update data is required' });
  }

  if (typeof updateData !== 'object' || Array.isArray(updateData)) {
    return res.status(400).json({ message: 'Invalid update data format' });
  }

  // Validar que el objeto no esté vacío
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: 'Update data is required' });
  }

  try {
    const updatedUser = await updateUserController(id, updateData);
    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = updateUserHandler;
