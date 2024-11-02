const { Reservation } = require('../../models/index'); // Ajusta esta ruta si es necesario

const createReservationController = async (reservationData) => {
  console.log('Datos recibidos en el controlador:', reservationData);  // Verificación de datos de entrada
  try {
    const { userId, roomId, checkIn, checkOut, numberOfGuests, totalPrice, status } = reservationData;
    // Crear la nueva reserva
    const newReservation = await Reservation.create({
      userId,
      roomId,
      checkIn,
      checkOut,
      numberOfGuests,
      totalPrice,
      status,
    });
    return newReservation; // Retorna la nueva reserva creada
  }catch (error) {
    console.error('Error al crear la reserva:', error.message); // Solo imprime el mensaje del error
    throw error; // Lanza el error para que sea manejado en el handler
  }
};
module.exports = createReservationController;

