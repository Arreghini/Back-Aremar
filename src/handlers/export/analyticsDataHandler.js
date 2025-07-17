const ExcelJS = require('exceljs');

const { getAnalyticsData } = require('../../controllers/export/analyticsDataController');

const exportAnalyticsToExcel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const analyticsData = await getAnalyticsData(startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Analytics');

    // Definir columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 7 },
      { header: 'Reservas', key: 'reservations', width: 7 },
      { header: 'Ingresos', key: 'revenue', width: 7 },
    ];

    // Agregar filas
    analyticsData.forEach((row) => {
      worksheet.addRow({
        date: row.date,
        reservations: row.reservations,
        revenue: row.revenue,
      });
    });

    // Encabezados para descarga
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=analytics_${startDate}_a_${endDate}.xlsx`
    );

    // Escribir en la respuesta
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al generar el Excel:', error);
    res.status(500).json({ error: 'Error al generar el archivo Excel' });
  }
};

module.exports = { exportAnalyticsToExcel };
en 