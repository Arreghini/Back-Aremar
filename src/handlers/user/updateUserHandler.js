
const updateUserController = require('../../controllers/user/updateProfileController');

const updateUserHandler = async (req, res) => {
  const { id } = req.params; 
  const userData = req.body; 

  try {
    const updatedUser = await updateUserController(id, userData);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error in updateUser handler:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = updateUserHandler;
