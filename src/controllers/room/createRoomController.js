// const Room= require('../../models/Room');

// const roomCreateController = async (req, res) => {

//   const { id, description, typeRoom, detailRoom, photoRoom, status } = req.body;

//   if (!id || !description || !typeRoom || !detailRoom || !photoRoom || !status) {
//     return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
//   }

//   try {
//     const roomCreated = await Room.create({
//       id,
//       description,
//       typeRoom,
//       detailRoom,
//       photoRoom,
//       status
//     });

//     return res.status(201).json(roomCreated);
//   } catch (error) {
//     console.error('Error creating room:', error);
//     return res.status(500).json({ message: 'Error creating room', error });
//   }
// };

// module.exports = roomCreateController;

// Asumo que roomCreateController recibe los datos de la habitación y los guarda en la base de datos
const Room = require('../../models/Room'); 

const roomCreateController = async (roomData) => {
  try {
    const room = await Room.create(roomData);
    return room;
  } catch (error) {
    console.error('Error al crear la habitación:', error);
    throw error; // Lanza el error para que sea capturado por el manejador
  }
};

module.exports = roomCreateController;
