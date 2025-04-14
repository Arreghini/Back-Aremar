const cancelReservationWithRefundController = require('../../controllers/reservation/cancelReservationWithRefundController.js');

const cancelReservationWithRefundHandler = async (req, res) => {
  const { reservationId } = req.params;
  const userId = req.user?.id; // Asumimos que el middleware de auth agrega `user` al req
  const isAdmin = req.isAdmin || false;

  try {
    const refundInfo = await cancelReservationWithRefundController({
      reservationId,
      userId,
      isAdmin
    });

    res.status(200).json({
      message: 'Reserva cancelada con reembolso exitosamente',
      refund: refundInfo
    });
  } catch (error) {
    console.error('Error al cancelar la reserva con reembolso:', error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = cancelReservationWithRefundHandler;
