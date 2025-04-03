const express = require('express');
const router = express.Router();

router.get('/redirect', (req, res) => {
    console.log("Solicitud recibida en /redirect");

    // Extraer y filtrar los parámetros relevantes
    const { status, reservationId } = req.query;

    // Si status es un array, toma el primer valor
    const normalizedStatus = Array.isArray(status) ? status[0] : status;

    console.log("Parámetros principales normalizados:", { status: normalizedStatus, reservationId });

    // Validar parámetros principales
    if (!normalizedStatus || !reservationId || !["approved", "pending", "failure", "success"].includes(normalizedStatus)) {
        console.error('Parámetros inválidos en la solicitud');
        return res.status(400).send('Parámetros inválidos');
    }

    // Construir la URL de redirección al frontend
    const frontendUrl = `${process.env.FRONTEND_URL}/home?status=${normalizedStatus}&reservationId=${reservationId}`;
    console.log("Redirigiendo a la URL del frontend:", frontendUrl);

    try {
        res.redirect(frontendUrl);
    } catch (error) {
        console.error("Error durante la redirección:", error);
        res.status(500).send('Error durante la redirección');
    }
});

module.exports = router;
