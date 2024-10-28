
const deleteRoomController = require('../../controllers/room/deleteRoomController');

const deleteRoomHandler = async (req, res) => {
  try {
    const id = req.params.id; // Extrae el ID de los parámetros
    console.log('Datos recibidos desde el dashboard para eliminar la habitación:', { 
      id, // ID de la habitación en los parámetros de la ruta
      headers: req.headers, // Headers de la solicitud (incluyendo autorización si se envía)
      user: req.user, // Información del usuario autenticado (si jwtCheck la añade al req)
    });
    const room = await deleteRoomController(id); // Pasa el ID al controlador
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error in deleteRoom handler:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = deleteRoomHandler;
