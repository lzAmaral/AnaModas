const OrderModel = require('../models/orderModel');
const ProductModel = require('../models/productModel');

class DashboardService {
  async getDashboardData() {
    const stats = await OrderModel.getStats();
    const lowStock = await ProductModel.getLowStock(5);
    const topProducts = await ProductModel.getTopProducts(5);

    return {
      total_orders: stats.total_orders,
      total_revenue: stats.total_revenue,
      low_stock_products: lowStock,
      top_products: topProducts.map(p => ({
        ...p,
        sold_quantity: parseInt(p.sold_quantity, 10)
      }))
    };
  }
}

module.exports = new DashboardService();
