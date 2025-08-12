// chartUtils.js
const { exec } = require('child_process');
const path = require('path');

const generateChart = (startDate, endDate, authToken) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../../../scripts/generateChart.py');
    const outputSvgPath = path.join(__dirname, '../../../temp_chart.svg');
    const outputPngPath = path.join(__dirname, '../../../temp_chart.png');
    const command = `python "${scriptPath}" "${startDate}" "${endDate}" "${authToken}" "${outputSvgPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }

      if (stdout.includes('SUCCESS:') && stdout.includes('SUCCESS_PNG:')) {
        resolve({ svgPath: outputSvgPath, pngPath: outputPngPath });
      } else {
        reject(new Error('Script Python no generó el archivo PNG correctamente'));
      }
    });
  });
};

module.exports = { generateChart };
