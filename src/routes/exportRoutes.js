const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');

const {
  getAnalyticsData,
  getMonthlyOccupancy,
  getRevenueByRoomType,
  getFrequentCustomers,
} = require('../controllers/export/analyticsDataController');

function styleHeader(row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E90FF' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
}

function styleDataRows(sheet, formatMap = {}) {
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    row.eachCell((cell, colNumber) => {
      const columnKey = sheet.columns[colNumber - 1]?.key;
      if (formatMap[columnKey]) {
        cell.numFmt = formatMap[columnKey];
      }
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });
}

// Ruta 1: Exportar Excel completo
router.get('/excel/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const workbook = new ExcelJS.Workbook();

    // Hoja: Resumen
    const summaryData = await getAnalyticsData(startDate, endDate);
    const resumenSheet = workbook.addWorksheet('Resumen');
    resumenSheet.columns = [
      { header: 'Habitación', key: 'roomId', width: 15 },
      { header: 'Ingreso Total', key: 'income', width: 20 },
      { header: 'Días Libres', key: 'freeDays', width: 15 },
      { header: 'Días Ocupados', key: 'occupiedDays', width: 18 },
      { header: 'Días Disponibles', key: 'totalDays', width: 20 },
      { header: 'Ocupación (%)', key: 'occupancy', width: 18 },
      { header: 'Reservas', key: 'sumReservations', width: 15 },
    ];
    summaryData.forEach((row) => resumenSheet.addRow(row));
    styleHeader(resumenSheet.getRow(1));
    styleDataRows(resumenSheet, {
      income: '"$"#,##0.00;[Red]\\-"$"#,##0.00',
      occupancy: '0.00%',
    });

    // Hoja: Ingresos por tipo de habitación
    const revenueData = await getRevenueByRoomType(startDate, endDate);
    const revenueSheet = workbook.addWorksheet('Ingresos por Tipo');
    revenueSheet.columns = [
      { header: 'Tipo de Habitación', key: 'roomType', width: 25 },
      { header: 'Cantidad de Habitaciones', key: 'roomCount', width: 20 },
      { header: 'Ingreso Promedio', key: 'averageRevenue', width: 20 },
      { header: 'Ingreso Total', key: 'totalRevenue', width: 20 },
    ];
    revenueData.forEach((row) => revenueSheet.addRow(row));
    styleHeader(revenueSheet.getRow(1));
    styleDataRows(revenueSheet, {
      averageRevenue: '"$"#,##0.00',
      totalRevenue: '"$"#,##0.00',
    });

    // Hoja: Clientes frecuentes
    const frequentData = await getFrequentCustomers(startDate, endDate);
    const customersSheet = workbook.addWorksheet('Clientes Frecuentes');
    customersSheet.columns = [
      { header: 'Cliente', key: 'name', width: 25 },
      { header: 'Correo Electrónico', key: 'email', width: 30 },
      { header: 'Cantidad de Reservas', key: 'reservationCount', width: 22 },
      { header: 'Monto Total', key: 'totaPrice', width: 20 },
    ];
    frequentData.forEach((row) => customersSheet.addRow(row));
    styleHeader(customersSheet.getRow(1));
    styleDataRows(customersSheet, {
      totaPrice: '"$"#,##0.00',
    });

    // Configuración de headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=analytics.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al generar Excel');
  }
});

// Ruta 2: Exportar solo ocupación mensual
router.get('/excel/analytics/monthly-occupancy', async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: 'Faltan parámetros year o month' });
    }

    const workbook = new ExcelJS.Workbook();
    const occupancyData = await getMonthlyOccupancy(year, month);

    const occupancySheet = workbook.addWorksheet('Ocupación Mensual');
    occupancySheet.columns = [
      { header: 'Mes', key: 'month', width: 15 },
      { header: 'Ocupación (%)', key: 'occupancy', width: 18 },
    ];
    occupancyData.forEach((row) => occupancySheet.addRow(row));
    styleHeader(occupancySheet.getRow(1));
    styleDataRows(occupancySheet, {
      occupancy: '0.00%',
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=monthly_occupancy.xlsx'
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al generar Excel de ocupación mensual');
  }
});

module.exports = router;
