const { RoomType } = require('../../../models');

const deleteTypeController = async (id) => {
  const deleted = await RoomType.destroy({
    where: { id },
    force: true,
  });

  if (!deleted) {
    throw new Error('No se pudo eliminar el tipo de habitación');
  }

  return true;
};
module.exports = deleteTypeController;
