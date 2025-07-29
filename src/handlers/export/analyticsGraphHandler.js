const { getSoldVsUnsoldByDay } = require('../../controllers/export/analyticsGraphController');

const exportAnalyticsGraphToJson = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Parámetros startDate y endDate requeridos' });
    }

    const data = await getSoldVsUnsoldByDay(startDate, endDate);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error al obtener datos de gráfico:', error);
    res.status(500).json({ error: 'Error interno al generar los datos' });
  }
};

module.exports = {
  exportAnalyticsGraphToJson,
};
