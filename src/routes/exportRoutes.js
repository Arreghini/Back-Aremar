const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const { 
  analyticsDataHandler, 
  getMonthlyOccupancyHandler, 
  getRevenueByRoomTypeHandler, 
  getFrequentCustomersHandler 
} = require('../handlers/export/analyticsDataHandler');

router.get('/excel/analytics', async (req, res) => {
  try {
     console.log('Query completo:', req.query);
    const { startDate, endDate } = req.query;
    const data = await require('../controllers/export/analyticsDataController').getAnalyticsData(startDate, endDate);
console.log('Rango de fechas extraído:', { startDate, endDate });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resumen');

    // Encabezados
    worksheet.columns = [
      { header: 'Habitación', key: 'roomId' },
      { header: 'Ingreso Total', key: 'income' },
      { header: 'Días Libres', key: 'freeDays' },
      { header: 'Reservas', key: 'sumReservations' },
    ];

    // Agregar filas
    data.forEach(entry => {
      worksheet.addRow(entry);
    });

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al generar Excel');
  }
});

// Rutas adicionales para los diferentes tipos de datos analíticos
router.get('/analytics', analyticsDataHandler);
router.get('/analytics/monthly-occupancy', getMonthlyOccupancyHandler);
router.get('/analytics/revenue-by-room-type', getRevenueByRoomTypeHandler);
router.get('/analytics/frequent-customers', getFrequentCustomersHandler);

module.exports = router;
