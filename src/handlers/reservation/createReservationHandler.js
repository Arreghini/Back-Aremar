const createReservationController = require('../../controllers/reservation/createReservationController');

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
