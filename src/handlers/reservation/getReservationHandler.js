const getReservationController = require('../../controllers/reservation/getReservationController.js');

// Handler para obtener todas las reservas
const getAllReservationHandler = async (req, res) => {
  try {
    const reservations = await getReservationController.getAllReservationController(); 
    console.log('Obtención de todas las reservas:', reservations);
    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error al obtener las reservas:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Handler para obtener las reservas de un usuario específico por su ID
const getReservationByUserIdHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validación del formato
    if (!userId) {
      return res.status(400).json({ message: 'UserId es requerido' });
    }

    console.log('ID de usuario recibido:', userId);
    console.log('ID de usuario en auth:', req.auth?.payload?.sub);  
    
    const userReservations = await getReservationController.getReservationByUserIdController(userId);
    
    return res.status(200).json({
      success: true,
      data: userReservations,
      userId: userId,
      formattedUserId: `google-oauth2|${userId}`
    });

  } catch (error) {
    console.error('Error completo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las reservas',
      error: error.message
    });
  }
};

// Handler para obtener una reserva específica por su ID
const getReservationByIdHandler = async (req, res) => {
  const { reservationId } = req.params;
  try {
    if (!reservationId) {
      return res.status(400).json({ message: 'El ID de la reserva es obligatorio' });
    }

    const reservation = await getReservationController.getReservationByIdController(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    console.log('Obtención de la reserva por ID:', reservation);
    res.status(200).json(reservation);
  } catch (error) {
    console.error('Error al obtener la reserva por ID:', error.message);
    res.status(500).json({ message: 'Error al obtener la reserva' });
  }
};

// Exportar los handlers
const getReservationHandler = {
  getAllReservationHandler,
  getReservationByUserIdHandler,
  getReservationByIdHandler,
};

module.exports = getReservationHandler;
