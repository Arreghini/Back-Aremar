const { user } = require('../../models/users')
const { guestProfile } = require('../../models/guestProfile')

const createGuestProfileController =  async (fullname, phoneNumber, dni, address, gender,photoURL) => {
    const newGuestProfile = await guestProfile.create({ 
    fullname, 
    phoneNumber, 
    dni, 
    address, 
    gender, 
    photoURL, // guarda la Url de la foto en la base de datos
    })
    return newGuestProfile

};

module.exports = createGuestProfileController;


