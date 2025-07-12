const { RoomDetail } = require('../../../models');

const createDetailController = async (data) => {
  try {
    const { id, cableTvService, smart_TV, wifi, microwave, pava_electrica } =
      data;

    const newDetail = await RoomDetail.create({
      id,
      cableTvService,
      smart_TV,
      wifi,
      microwave,
      pava_electrica,
    });

    return newDetail;
  } catch (error) {
    console.error('Error al crear el detalle de la habitación:', error);
    throw error;
  }
};

module.exports = createDetailController;
