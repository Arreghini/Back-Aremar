const { RoomDetail } = require('../../models');

const createDetailController = async (data) => {
  try {
    const {
      id,
      roomId,
      description,
      amenities,
      photos,
    } = data;

    const newDetail = await RoomDetail.create({
      id,
      roomId,
      description,
      amenities,
      photos,
    });
    
    return newDetail; 
  } catch (error) {
    console.error('Error al crear el detalle de la habitación:', error); 
    throw error; 
  }
};

module.exports = createDetailController; 
