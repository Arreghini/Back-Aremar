const getReservationsController = require('../../controllers/reservation/getReservationsController.js');

const getReservations = async (req, res) => {
    const { userId, reservationId } = req.query;
    const user = req.user;

    try {
        let reservations;

        // Verificar si el usuario es administrador
        if (user.isAdmin) {
            reservations = await getReservationsController.getAllReservationsController();
            return res.status(200).json(reservations);
        }

        // Obtener reservas por `userId`
        if (userId) {
            if (userId !== user.id) {
                return res.status(403).json({ error: 'No tienes permiso para ver las reservas de este usuario' });
            }
            reservations = await getReservationsController.getReservationsByUserIdController(userId);
            return res.status(200).json(reservations);
        }

        // Obtener una reserva específica por `reservationId`
        if (reservationId) {
            const reservation = await getReservationsController.getReservationsByIdController(reservationId);

            // Verificar si la reserva pertenece al usuario autenticado
            if (!reservation || reservation.userId !== user.id) {
                return res.status(403).json({ error: 'No tienes permiso para ver esta reserva' });
            }

            return res.status(200).json(reservation);
        }

        // Si no se pasa ningún parámetro válido
        return res.status(400).json({ error: 'Parámetros insuficientes para obtener reservas' });

    } catch (error) {
        console.error('Error al obtener las reservas:', error);
        return res.status(500).json({ error: 'Error al obtener las reservas' });
    }
};

module.exports = getReservations;
