const { Room } = require('../../models');

const getRoomByIdController = async (id) => { 
  try {
    const room = await Room.findByPk(id); 
    return room ;
  } catch (error) {
    console.error('Error fetching room:', error); 
    throw error;
  }
};

module.exports = getRoomByIdController;
