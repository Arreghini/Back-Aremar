const express = require('express');
const router = express.Router();
const { exportAnalyticsToExcel } = require('../handlers/export/analyticsDataHandler');
const { exportAnalyticsGraphToJson }  = require('../handlers/export/analyticsGraphHandler');

router.get('/excel/analytics/json',exportAnalyticsGraphToJson);
router.get('/excel/analytics',exportAnalyticsToExcel);

module.exports = router;
