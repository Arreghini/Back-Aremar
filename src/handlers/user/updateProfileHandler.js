const updateUserController = require('../../controllers/user/updateProfileController');

const updateUserHandler = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  if (!updateData || typeof updateData !== 'object') {
    return res.status(400).json({ message: 'Update data is required' });
  }

  const hasValidFields = Object.values(updateData).some(
    (val) => val !== null && val !== undefined && val !== ''
  );

  if (!hasValidFields) {
    return res.status(400).json({ message: 'Update data cannot be empty' });
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
