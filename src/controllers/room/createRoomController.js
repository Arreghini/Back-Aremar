import { Room } from '../../models/Room';

const roomCreateController = async (req, res) => {

  const { id, description, typeRoom, detailRoom, photoRoom, status } = req.body;

  if (!id || !description || !typeRoom || !detailRoom || !photoRoom || !status) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    const roomCreated = await Room.create({
      id,
      description,
      typeRoom,
      detailRoom,
      photoRoom,
      status
    });

    return res.status(201).json(roomCreated);
  } catch (error) {
    console.error('Error creating room:', error);
    return res.status(500).json({ message: 'Error creating room', error });
  }
};

export default roomCreateController;
