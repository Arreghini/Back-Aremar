const deleteRoomTypeController = require('../../../controllers/room/roomType/deleteRoomTypeController');

const deleteRoomTypeHandler = async (req, res) => {
  const { id } = req.params;
  
  try {
    await deleteRoomTypeController(id);
    
    // Enviamos solo la confirmación de eliminación
    res.status(200).json({
      deleted: true,
      id: id
    });
    
  } catch (error) {
    res.status(500).json({
      deleted: false,
      error: error.message
    });
  }
};

module.exports = deleteRoomTypeHandler;
