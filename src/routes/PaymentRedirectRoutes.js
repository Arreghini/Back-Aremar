const express = require('express');
const router = express.Router();

router.get('/redirect', (req, res) => {
    console.log("Solicitud recibida en /redirect");

    // Log para depurar todos los parámetros recibidos
    console.log("Todos los parámetros recibidos:", req.query);

    let { status, reservationId } = req.query;

    // Si status es un array, toma el primer valor
    if (Array.isArray(status)) {
        status = status[0];
    }

    // Log para depurar los parámetros principales
    console.log("Parámetros principales normalizados:", { status, reservationId });

    // Validar parámetros principales
    if (!status || !reservationId || !["approved", "pending", "failure", "success"].includes(status)) {
        console.error('Parámetros inválidos en la solicitud');
        return res.status(400).send('Parámetros inválidos');
    }

    // Construir la URL de redirección al frontend
    const frontendUrl = `${process.env.FRONTEND_URL}/payment-status?status=${status}&reservationId=${reservationId}`;
    console.log("Redirigiendo a la URL del frontend:", frontendUrl);

    try {
        res.setHeader('ngrok-skip-browser-warning', 'true');
        res.redirect(frontendUrl);
    } catch (error) {
        console.error("Error durante la redirección:", error);
        res.status(500).send('Error durante la redirección');
    }
});

module.exports = router;