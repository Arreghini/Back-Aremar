const express = require('express');
const router = express.Router();
const { exportAnalyticsToExcel } = require('../handlers/export/analyticsDataHandler');

router.get('/excel/analytics', exportAnalyticsToExcel);

module.exports = router;
