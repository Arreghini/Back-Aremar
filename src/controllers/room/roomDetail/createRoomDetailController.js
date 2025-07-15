const { RoomDetail } = require('../../../models');

const createDetailController = async (data) => {
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Missing data to create room detail');
  }

  try {
    // Directamente pasa todo el objeto data a create
    const newDetail = await RoomDetail.create(data);
    return newDetail;
  } catch (error) {
    console.error('Error al crear el detalle de la habitación:', error);
    throw error;
  }
};

module.exports = createDetailController;
