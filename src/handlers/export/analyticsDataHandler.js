const analyticsDataController = require('../../controllers/export/analyticsDataController');

const analyticsDataHandler = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analyticsData = await analyticsDataController.getAnalyticsData(startDate, endDate);
    res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Error en analyticsDataHandler:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
const getMonthlyOccupancyHandler = async (req, res) => {
  try {
    const { year, month } = req.query;
    const occupancyData = await analyticsDataController.getMonthlyOccupancy(year, month);
    res.status(200).json(occupancyData);
  } catch (error) {
    console.error('Error en getMonthlyOccupancyHandler:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
const getRevenueByRoomTypeHandler = async (req, res) => {
  try {
    const { startDate, endDate } = req.query; 
    const revenueData = await analyticsDataController.getRevenueByRoomType(year, month);
    res.status(200).json(revenueData);
  } catch (error) {
    console.error('Error en getRevenueByRoomTypeHandler:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
const getFrequentCustomersHandler = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const frequentCustomers = await analyticsDataController.getFrequentCustomers(startDate, endDate);
    res.status(200).json(frequentCustomers);
  } catch (error) {
    console.error('Error en getFrequentCustomersHandler:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


module.exports = { analyticsDataHandler, 
    getMonthlyOccupancyHandler, 
    getRevenueByRoomTypeHandler, 
    getFrequentCustomersHandler };
