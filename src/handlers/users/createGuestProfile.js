const createGuestProfileController = require('../../controllers/users/createGuestProfile');
const upload = require('../../almacenamientoS3/multerConfig'); 

const createGuestProfile = async (req, res) => {
  try {
    // Usa el middleware de multer para manejar la subida del archivo
    upload.single('photo')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Extrae los datos del cuerpo de la solicitud y del usuario logueado
      const { fullname, phoneNumber, dni, address, gender } = req.body;
      const { userId, email } = req.user; // Supone que req.user contiene la información del usuario logueado

      // Verifica que los campos requeridos no estén vacíos
      if (!fullname || !gender || !userId || !email) {
        return res.status(400).json({ message: 'Please provide all required fields: fullname, gender, userId, email' });
      }

      // Obtiene la URL de la foto subida o asigna 'not found' si no hay archivo
      const photoUrl = req.file ? req.file.location : 'not found';

      try {
        // Llama al controlador para crear el perfil del invitado
        const newGuestProfile = await createGuestProfileController(userId, email, fullname, phoneNumber, dni, address, gender, photoUrl);
        res.status(201).json(newGuestProfile);
      } catch (error) {
        console.error('Error creating guest profile:', error);
        return res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = createGuestProfile;

