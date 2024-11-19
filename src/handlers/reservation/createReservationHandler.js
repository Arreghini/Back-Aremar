const createReservationControll

const checkRoomAvailability = async (roomId, checkIn, checkOut) => {
  const existingReservations = await Reservation.findAll({
    where: {
      roomId,
      [Op.or]: [
        {
          checkIn: {
            [Op.between]: [checkIn, checkOut]
          }
        },
        {
          checkOut: {
            [Op.between]: [checkIn, checkOut]
          }
        }
      ]
    }
  });
  return existingReservations.length === 0;
};
const calculateTotalPrice = async (roomId, checkIn, checkOut) => {
  const room = await Room.findByPk(roomId);
  const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  return room.pricePerNight * days;
};

const createReservationHandler = async (req, res) => {
  const { sub: userId } = req.user; // Obtenemos el ID del usuario del token
  const { 
    roomId,
    checkIn,
    checkOut,
    numberOfGuests,
    totalPrice,
    status = 'pending' // Estado inicial de la reserva
  } = req.body;

  try {
    const newReservation = await createReservationController({
      userId,
      roomId,
      checkIn,
      checkOut,
      numberOfGuests,
      totalPrice,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: newReservation
    });

  } catch (error) {
    console.error('Error al crear la reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la reserva',
      error: error.message
    });
  }
};

module.exports = createReservationHandler;
