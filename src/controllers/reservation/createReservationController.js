const { Reservation } = require('../../models/index'); 
const { getAvailableRoomsController } = require('../room/getRoomController'); 
const calculateTotalPrice = require('../../utils/calculateTotalPrice'); 

const createReservationController = async (reservationData) => {
  console.log('Datos recibidos en controlador:', {
    roomId: reservationData.roomId,
    checkIn: reservationData.checkIn,
    checkOut: reservationData.checkOut,
    datosCompletos: reservationData
  });
  const { roomId, checkIn, checkOut } = reservationData;

  try {
    // Verificar disponibilidad
    const isAvailable = await getAvailableRoomsController(roomId, checkIn, checkOut);
    if (!isAvailable) {
      throw new Error('La habitación no está disponible para las fechas seleccionadas');
    }

    // Calcular precio total
    const totalPrice = await calculateTotalPrice(roomId, checkIn, checkOut);

    // Crear la reserva con estado pending
    const newReservation = await Reservation.create({
      ...reservationData,
      totalPrice,
      status: 'pending',
    });

    return newReservation;
  } catch (error) {
    console.error('Error al crear la reserva:', error.message); // Solo imprime el mensaje del error
    throw error; // Lanza el error para que sea manejado en el handler
  }
};

module.exports = createReservationController;
