const DashboardService = require('../services/dashboardService');

class DashboardController {
  async getDashboardData(req, res, next) {
    try {
      const data = await DashboardService.getDashboardData();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();
