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
  const { userId } = req.params;
  console.log('ID de Auth0 recibido:', userId);
  try {
    const userReservations = await getReservationController.getReservationByUserIdController(userId);
    console.log('Reservas encontradas:', userReservations.length);
    console.log('Reservas encontradas:', userReservations);
    res.status(200).json(userReservations);
  } catch (error) {
    console.error('Error detallado:', error);
    res.status(400).json({ message: error.message });
  }
};

// Handler para obtener una reserva específica por su ID
const getReservationByIdHandler = async (req, res) => {
  const { reservationId } = req.query; 
  try {
    const reservation = await getReservationController.getReservationByIdController(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    console.log('Obtención de la reserva por ID:', reservation);
    res.status(200).json(reservation);
  } catch (error) {
    console.error('Error al obtener la reserva por ID:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Exportar los handlers
const getReservationHandler = {
  getAllReservationHandler,
  getReservationByUserIdHandler,
  getReservationByIdHandler,
};

module.exports = getReservationHandler;
