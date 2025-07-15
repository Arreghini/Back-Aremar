const { RoomType } = require('../../../models');

const deleteTypeController = async (id) => {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('No se proporcionó un ID de tipo de habitación válido');
  }

  const foundTypes = await RoomType.findAll({ where: { id } });

  if (!foundTypes || foundTypes.length === 0) {
    return null;
  }

  const deleted = await RoomType.destroy({
    where: { id },
    force: true,
  });

  if (!deleted) {
    throw new Error('No se pudo eliminar el tipo de habitación');
  }

  return foundTypes;
};

module.exports = deleteTypeController;
