const { RoomType } = require('../../../models');

const updateRoomTypeController = async (id, updateData) => {
  try {
    console.log('=== DEBUG UPDATE CONTROLLER ===');
    console.log('roomTypeId recibido:', id);
    console.log('updateData recibido:', updateData);

    // ✅ Verificar si el tipo existe
    const existingRoomType = await RoomType.findByPk(id);
    console.log('RoomType encontrado:', existingRoomType ? 'SÍ' : 'NO');

    if (!existingRoomType) {
      console.log('RoomType no encontrado con ID:', id);
      throw new Error('Room type not found');
    }

    // ✅ Preparar datos para actualizar
    const dataToUpdate = {
      name: updateData.name,
      simpleBeds: parseInt(updateData.simpleBeds) || 0,
      trundleBeds: parseInt(updateData.trundleBeds) || 0,
      kingBeds: parseInt(updateData.kingBeds) || 0,
      windows: parseInt(updateData.windows) || 0,
      price: parseFloat(updateData.price) || 0,
    };

    // ✅ Solo agregar photos si existe en updateData
    if (updateData.photos) {
      dataToUpdate.photos = updateData.photos;
    }

    console.log('Datos preparados para actualizar:', dataToUpdate);

    // ✅ Actualizar el registro
    await RoomType.update(dataToUpdate, {
      where: { id },
    });

    // ✅ Obtener el registro actualizado
    const updatedRoomType = await RoomType.findByPk(id);
    console.log('RoomType actualizado exitosamente:', updatedRoomType?.name);

    return updatedRoomType;
  } catch (error) {
    console.error('Error en updateRoomTypeController:', error);
    throw error;
  }
};

module.exports = updateRoomTypeController;
