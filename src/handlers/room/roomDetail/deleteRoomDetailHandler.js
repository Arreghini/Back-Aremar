const deleteDetailController = require('../../../controllers/room/roomDetail/deleteRoomDetailController');

const deleteDetailHandler = async (req, res) => {
  try {
    const { id } = req.params; // Extraer el ID desde req.params
    const deleteDetail = await deleteDetailController(id); // Pasar solo el ID al controlador

    if (!deleteDetail) {
      return res.status(404).json({ error: 'RoomDetail no encontrado' });
    }

    return res.status(200).json({ message: 'RoomDetail eliminado con éxito' });
  } catch (error) {
    console.error('Error inesperado al manejar la solicitud:', error);
    return res.status(500).send('Error al manejar la solicitud');
  }
};

module.exports = deleteDetailHandler;
