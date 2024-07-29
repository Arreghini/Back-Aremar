
const { Room } = require('../../models'); 

const roomCreateController = async () => {
  const { id, description, typeRoom, detailRoom, photoRoom, status } = req.body;

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
    photoRoom,
    status
  });

  // Devolver la habitación creada
  return roomCreated;
};

module.exports = roomCreateController;
