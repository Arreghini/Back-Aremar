const deleteTypeController = require('../../../controllers/room/roomType/deleteRoomTypeController');

const deleteTypeHandler = async (req, res) => {
  try {
    const { id } = req.params; 
    const deletedType = await deleteTypeController(id); 

    if (!deletedType) {
      return res.status(404).json({ error: 'RoomType no encontrado' });
    }

    return res.status(200).json({ message: 'RoomType eliminado con éxito' });
  } catch (error) {
    console.error('Error inesperado al manejar la solicitud:', error); 
    return res.status(500).send('Error al manejar la solicitud');
  }
};

module.exports = deleteTypeHandler;
