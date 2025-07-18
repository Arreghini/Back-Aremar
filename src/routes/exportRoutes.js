const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const dayjs = require('dayjs');

const {
  getAnalyticsData,
  getMonthlyOccupancy,
  getRevenueByRoomType,
  getFrequentCustomers,
  getDailyRoomOccupancy,
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

    // Hoja 1: Resumen
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

    // Hoja 2: Ingresos por tipo
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

    // Hoja 3: Clientes frecuentes
    const frequentData = await getFrequentCustomers(startDate, endDate);
    const customersSheet = workbook.addWorksheet('Clientes Frecuentes');
    customersSheet.columns = [
      { header: 'Cliente', key: 'name', width: 25 },
      { header: 'Correo Electrónico', key: 'email', width: 30 },
      { header: 'Cantidad de Reservas', key: 'reservationCount', width: 22 },
      { header: 'Monto Total', key: 'totalPrice', width: 20 },
    ];
    frequentData.forEach((row) => customersSheet.addRow(row));
    styleHeader(customersSheet.getRow(1));
    styleDataRows(customersSheet, {
      totalPrice: '"$"#,##0.00',
    });

    // Hoja 4: Ocupación diaria con colores
    const occupancyData = await getDailyRoomOccupancy(startDate, endDate);
    const occupancySheet = workbook.addWorksheet('Ocupación Diaria');

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const totalDays = end.diff(start, 'day') + 1;

   occupancySheet.columns = [
  { header: 'Habitación', key: 'roomId', width: 10 },
  ...Array.from({ length: totalDays }, (_, i) => {
    const key = start.add(i, 'day').format('YYYY-MM-DD'); 
    const header = start.add(i, 'day').format('MM-DD');   
    return { header, key, width: 9 }; 
  }),
];

    const groupedData = {};
    occupancyData.forEach(entry => {
      if (!groupedData[entry.roomId]) groupedData[entry.roomId] = {};
      groupedData[entry.roomId][entry.date] = entry.status;
    });

    for (const roomId in groupedData) {
      const rowData = { roomId };
      for (let i = 0; i < totalDays; i++) {
        const date = start.add(i, 'day').format('YYYY-MM-DD');
        rowData[date] = groupedData[roomId][date] || 'libre';
      }

      const row = occupancySheet.addRow(rowData);

      for (let i = 1; i <= totalDays; i++) {
        const cell = row.getCell(i + 1);
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (cell.value === 'ocupado') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFB6D7A8' }, // verde
          };
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC7CE' }, // rojo
          };
        }
      }
    }
occupancySheet.addRows(occupancyData);

// Ahora ajustamos la altura de cada fila
occupancySheet.eachRow((row, rowNumber) => {
  row.height = 25;
});

    styleHeader(occupancySheet.getRow(1));

    // Set filename dinámico
    const safeStart = new Date(startDate).toISOString().split('T')[0];
    const safeEnd = new Date(endDate).toISOString().split('T')[0];
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=analytics_${safeStart}_al_${safeEnd}.xlsx`
    );

   await workbook.xlsx.write(res);
   res.end(); 

  } catch (err) {
    console.error(err);
    res.status(500).send('Error al generar Excel');
  }
});

module.exports = router;
