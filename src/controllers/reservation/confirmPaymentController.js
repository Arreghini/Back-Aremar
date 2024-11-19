const Reservation = require('../../models/index');
const Room = require('../../models/index');

const confirmPayment = async (req, res) => {
    const { reservationId } = req.body;
  
      const reservation = await Reservation.findByPk(reservationId);
  
      if (!reservation || reservation.status !== 'pending') {
        return res.status(400).json({ message: 'Reserva no válida o ya confirmada.' });
      }
  
      // Cambiar estado de la reserva a confirmado
      reservation.status = 'confirmed';
      await reservation.save();
  
      // Liberar la habitación (ya no está pendiente)
      const room = await Room.findByPk(reservation.roomId);
      if (room) {
        room.status = 'available';
        await room.save();
      }
    };

module.exports = confirmPayment;