const {GuestProfile} = require('../../db');

const updateGuestProfileController = async (userId, fieldsToUpdate) => {

 const guestProfile = await GuestProfile.findOne({
    where: {userId}
 })

 if(!guestProfile){
    throw new Error('Guest Profile not found')
 }
 
 const updateGuestProfile = await guestProfile.update(fieldsToUpdate)

  return updateGuestProfile
}

module.exports = updateGuestProfileController;