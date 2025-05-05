const { RoomType } = require('../../../models');

const createTypeController = async (data) => {
  try {
    const {
      id,
      roomType,
      photos,
      simpleBeds,
      trundleBeds,
      kingBeds, 
      windows,
      price, 
    } = data;

    const newType = await RoomType.create({
      id,
      roomType,
      photos,
      simpleBeds,
      trundleBeds,
      kingBeds,
      windows,
      price, 
    });

    return newType; 
  } catch (error) {
    console.error('Error al crear el tipo de habitación:', error); 
    throw error; 
  }
};

module.exports = createTypeController;
