
const { Room } = require('../../models'); 

const roomCreateController = async (req,res) => {
  const { id, description, typeRoom, detailRoom, price, photoRoom, status } = req.body;

  // Verificar si la habitación ya existe
  const existingRoom = await Room.findByPk(id);
  if (existingRoom) {
    throw new Error('Room with this ID already exists');
  }

  // Crear la habitación
  const roomCreated = await Room.create({
    id,
    description,
    typeRoom,
    detailRoom,
    price,
    photoRoom,
    status
  });

  // Devolver la habitación creada
  return roomCreated;
};

module.exports = roomCreateController;
