const ExcelJS = require('exceljs');
const dayjs = require('dayjs');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const {
  getAnalyticsData,
  getRevenueByRoomType,
  getFrequentCustomers,
  getDailyRoomOccupancy,
} = require('../../controllers/export/analyticsDataController');
const { getSoldVsUnsoldByDay } = require('../../controllers/export/analyticsGraphController');

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

// Función para ejecutar el script Python y generar gráfico (SVG y PNG)
const generateChart = (startDate, endDate, authToken) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../../../scripts/generateChart.py');
    const outputSvgPath = path.join(__dirname, '../../../temp_chart.svg');
    // El PNG lo asume que se genera con el mismo nombre que el SVG pero extensión .png
    // Asegurate que el script Python lo haga así
    const outputPngPath = path.join(__dirname, '../../../temp_chart.png');

    // Ejecutar el script con argumentos: fechas, token y ruta SVG salida
    const command = `python "${scriptPath}" "${startDate}" "${endDate}" "${authToken}" "${outputSvgPath}"`;

    console.log('🐍 Ejecutando comando Python:', command);
    
    exec(command, (error, stdout, stderr) => {
      console.log('📤 stdout del script Python:', stdout);
      console.log('📤 stderr del script Python:', stderr);
      
      if (error) {
        console.error('❌ Error ejecutando Python script:', error);
        reject(error);
        return;
      }

      if (stdout.includes('SUCCESS:') && stdout.includes('SUCCESS_PNG:')) {
        console.log('✅ Script Python completado exitosamente');
        resolve({ svgPath: outputSvgPath, pngPath: outputPngPath });
      } else {
        console.error('❌ Script Python no generó PNG correctamente');
        console.error('stdout completo:', stdout);
        reject(new Error('Script Python no generó el archivo PNG correctamente'));
      }
    });
  });
};

const exportAnalyticsToExcel = async (req, res) => {
  let chartFilesToCleanup = [];
  
  try {
    const { startDate, endDate } = req.query;
    const workbook = new ExcelJS.Workbook();

    // Obtener token de autorización del header
    const authToken = req.headers.authorization?.replace('Bearer ', '');

    // --- HOJA 1: Resumen ---
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

    // --- HOJA 2: Ingresos por tipo ---
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

    // --- HOJA 3: Clientes frecuentes ---
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

    // --- HOJA 4: Ocupación diaria ---
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
    occupancyData.forEach((entry) => {
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

    occupancySheet.eachRow((row) => {
      row.height = 25;
    });

    styleHeader(occupancySheet.getRow(1));

    // --- HOJA 5: Gráfico Ingresos (imagen PNG) ---
    try {
      console.log('📊 Iniciando generación de gráfico...');
      const { pngPath } = await generateChart(startDate, endDate, authToken);
      console.log('📊 Ruta esperada del PNG:', pngPath);

      if (fs.existsSync(pngPath)) {
        console.log('✅ Archivo PNG encontrado, agregando al Excel');
        const imageId = workbook.addImage({
          filename: pngPath,
          extension: 'png',
        });

        const graficoSheet = workbook.addWorksheet('Gráfico Ingresos');
        graficoSheet.addImage(imageId, {
          tl: { col: 0, row: 0 },
          ext: { width: 600, height: 400 },
        });

        // Marcar archivos para limpieza posterior (después de escribir el Excel)
        const svgPath = pngPath.replace('.png', '.svg');
        chartFilesToCleanup = [pngPath, svgPath];
        console.log('📋 Archivos marcados para limpieza posterior');
      } else {
        console.warn('⚠️ El archivo del gráfico PNG no existe en:', pngPath);
        console.warn('⚠️ Se omite el gráfico en el Excel.');
      }
    } catch (chartError) {
      console.error('❌ Error al generar o procesar el gráfico:', chartError);
      console.warn('⚠️ Se omite el gráfico en el Excel debido al error.');
    }

    // --- Enviar archivo Excel ---
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

    // Limpiar archivos temporales después de escribir el Excel
    if (chartFilesToCleanup.length > 0) {
      console.log('🗑️ Iniciando limpieza de archivos temporales...');
      chartFilesToCleanup.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('🗑️ Eliminado:', filePath);
        }
      });
    }

  } catch (error) {
    console.error('Error al generar el Excel:', error);
    
    // Limpiar archivos temporales incluso si hay error
    if (chartFilesToCleanup && chartFilesToCleanup.length > 0) {
      console.log('🗑️ Limpieza de emergencia de archivos temporales...');
      chartFilesToCleanup.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('🗑️ Eliminado:', filePath);
        }
      });
    }
    
    res.status(500).json({ error: 'Error al generar el archivo Excel' });
  }
};

module.exports = {
  exportAnalyticsToExcel,
};
