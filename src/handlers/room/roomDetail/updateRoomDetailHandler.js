const updateDetailController = require('../../../controllers/room/roomDetail/updateRoomDetailController');

const updateDetailHandler = async (req, res) => {
  try {
    const { id } = req.params; // Extraer el ID desde req.params
    const updateData = req.body; // Obtener los datos de actualización desde req.body

    const updatedDetail = await updateDetailController(id, updateData); // Pasar ID y datos al controlador

    if (!updatedDetail) {
      return res.status(404).json({ error: 'RoomDetail no encontrado' });
    }

    return res.status(200).json({ message: 'RoomDetail actualizado con éxito', data: updatedDetail });
  } catch (error) {
    console.error('Error inesperado al manejar la solicitud:', error); 
    return res.status(500).send('Error al manejar la solicitud');
  }
};

module.exports = updateDetailHandler;
