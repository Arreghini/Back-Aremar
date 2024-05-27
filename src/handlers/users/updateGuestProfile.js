const updateGuestProfileController = require('../../controllers/users/updateGuestProfile');
const upload = require('../../almacenamientoS3/multerConfig');

const updateProfile = async (req, res) => {
  try {
    // Usa el middleware de multer para manejar la subida del archivo
    upload.single('photo')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { userId, fullname, phoneNumber, dni, address, gender } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'Please provide the profile ID.' });
      }

      // Obtiene la URL de la foto subida o asigna undefined si no hay archivo
      const photoUrl = req.file ? req.file.location : undefined;

      try {
        const fieldsToUpdate = {};
        if (fullname !== undefined) fieldsToUpdate.fullname = fullname;
        if (phoneNumber !== undefined) fieldsToUpdate.phoneNumber = phoneNumber;
        if (dni !== undefined) fieldsToUpdate.dni = dni;
        if (address !== undefined) fieldsToUpdate.address = address;
        if (gender !== undefined) fieldsToUpdate.gender = gender;
        if (photoUrl !== undefined) fieldsToUpdate.photoUrl = photoUrl;

        // Actualizo el guestProfile
        const updatedGuestProfile = await updateGuestProfileController(userId, fieldsToUpdate);

        return res.status(200).json(updatedGuestProfile);
      } catch (updateError) {
        return res.status(500).json({ error: updateError.message });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = updateProfile;
