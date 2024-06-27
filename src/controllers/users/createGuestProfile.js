const { GuestProfile } = require('../../db');

const createGuestProfileController = async (userId, email, fullname, phoneNumber, dni, address, gender, photoUrl) => {
  const newGuestProfile = await GuestProfile.create({
    userId,
    email,
    fullname,
    phoneNumber,
    dni,
    address,
    gender,
    photoUrl, // guarda la URL de la foto en la base de datos
  });
  return newGuestProfile;
};

module.exports = createGuestProfileController;
