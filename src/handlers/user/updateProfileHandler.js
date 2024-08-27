const updateGuestProfileController = require('../controllers/user/updateProfileController');


const updateProfileHandler = async (req,res) => {

  const { sub: user_id } = req.user;
  const fieldsToUpdate = req.body
    
   try {
    const updatedGuestProfile = await updateGuestProfileController(user_id, fieldsToUpdate);
    res.status(200).json(updatedGuestProfile);
  } catch (error) {
    console.error('Error updating guest profile:', error);
    res.status(500).json({ message: 'Error updating guest profile' });
  }
};
module.exports = updateProfileHandler;