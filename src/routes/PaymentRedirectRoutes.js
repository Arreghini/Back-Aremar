const express = require('express');
const router = express.Router();

router.get('/redirect', (req, res) => {
    const { status, reservationId } = req.query;
    const normalizedStatus = Array.isArray(status) ? status[0] : status;

    if (!normalizedStatus || !reservationId) {
        return res.status(400).send('Parámetros inválidos');
    }

    const frontendUrl = `${process.env.FRONTEND_URL}/home?status=${normalizedStatus}&reservationId=${reservationId}`;
    
    res.redirect(frontendUrl);
});
module.exports = router;