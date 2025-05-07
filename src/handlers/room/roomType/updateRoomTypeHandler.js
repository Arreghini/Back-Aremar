const updateRoomTypeController = require('../../../controllers/room/roomType/updateRoomTypeController');

const updateRoomTypeHandler = async (req, res) => {
  try {
    const { roomTypeId } = req.params; // Extraer el ID desde req.params
    const updateData = req.body; // Obtener los datos de actualización desde req.body

    const updatedType = await updateRoomTypeController(roomTypeId, updateData); // Pasar ID y datos al controlador

    if (!updatedType) {
      return res.status(404).json({ error: 'RoomType no encontrado' });
    }

    return res.status(200).json({ message: 'RoomType actualizado con éxito', data: updatedType });
  } catch (error) {
    console.error('Error inesperado al manejar la solicitud:', error); 
    return res.status(500).send('Error al manejar la solicitud');
  }
};

module.exports = updateRoomTypeHandler;
