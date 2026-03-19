const db = require('../config/db');
const OrderModel = require('../models/orderModel');
const ProductModel = require('../models/productModel');
const ClientModel = require('../models/clientModel');

class OrderService {
  async createOrder({ client_name, client_phone, items, notes }) {
    if (!items || items.length === 0) {
      const error = new Error('Order must have items');
      error.isStockIssue = true; // reusing logic for 400
      throw error;
    }

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const clientId = await ClientModel.create(client_name, client_phone, client);
      const orderId = await OrderModel.create(clientId, notes, client);

      let calculatedTotalAmount = 0;

      for (const item of items) {
        const product = await ProductModel.checkStock(item.product_id, client);

        if (!product || product.stock_quantity < item.quantity) {
          const error = new Error(`Not enough stock for product ID: ${item.product_id}. Available: ${product ? product.stock_quantity : 0}`);
          error.isStockIssue = true;
          throw error;
        }

        const dbUnitPrice = Number(product.price);
        const dbTotalPrice = dbUnitPrice * item.quantity;
        calculatedTotalAmount += dbTotalPrice;

        await ProductModel.adjustStock(item.product_id, -item.quantity, client);
        await OrderModel.createItem(orderId, item.product_id, item.size, item.quantity, dbUnitPrice, dbTotalPrice, client);
      }

      await OrderModel.updateTotalAmount(orderId, calculatedTotalAmount, client);
      
      await client.query('COMMIT');
      return { id: orderId, total_amount: calculatedTotalAmount };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async deleteOrder(orderId) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Restore stock
      const items = await OrderModel.getItemsByOrderId(orderId, client);
      for (const item of items) {
        await ProductModel.adjustStock(item.product_id, item.quantity, client);
      }

      const deletedCount = await OrderModel.delete(orderId, client);
      await client.query('COMMIT');
      return deletedCount;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new OrderService();
