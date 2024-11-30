const updateReservationController = require('../../controllers/reservation/updateReservationController');

const updateReservationHandler = async (req, res) => {
    try {
      // Extraemos el ID de la URL y lo convertimos a número
      const reservationId = parseInt(req.url.split('/')[1]);
      
      // Extraemos los datos para actualizar
      const updatedData = {
        checkIn: req.body.body.checkIn,
        checkOut: req.body.body.checkOut,
        numberOfGuests: req.body.body.numberOfGuests,
        roomId: req.body.body.roomId,
        status: req.body.body.status
      };
  
      console.log('ID de reserva a actualizar:', reservationId);
      console.log('Datos a actualizar:', updatedData);
  
      const updatedReservation = await updateReservationController(reservationId, updatedData);
  
      return res.status(200).json({ 
        message: 'Reserva actualizada con éxito', 
        reservation: updatedReservation 
      });
    } catch (error) {
      console.error('Error en la actualización:', error);
      return res.status(500).json({ 
        error: 'Error al actualizar la reserva', 
        details: error.message 
      });
    }
  };
  
module.exports = updateReservationHandler;
