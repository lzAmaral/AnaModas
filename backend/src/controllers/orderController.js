const OrderModel = require('../models/orderModel');
const OrderService = require('../services/orderService');

class OrderController {
  async getAll(req, res, next) {
    try {
      const { status, date, search } = req.query;
      const orders = await OrderModel.getAll(status, date, search);
      res.json(orders);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const order = await OrderModel.getById(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json(order);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!['pendente', 'separado', 'entregue'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      const updated = await OrderModel.updateStatus(req.params.id, status);
      res.json({ updated });
    } catch (err) {
      next(err);
    }
  }

  async updatePaymentStatus(req, res, next) {
    try {
      const { payment_status } = req.body;
      if (!['pago', 'não pago'].includes(payment_status)) {
        return res.status(400).json({ error: 'Invalid payment status' });
      }
      const updated = await OrderModel.updatePaymentStatus(req.params.id, payment_status);
      res.json({ updated });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const deleted = await OrderService.deleteOrder(req.params.id);
      res.json({ deleted });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await OrderService.createOrder(req.body);
      res.json(result);
    } catch (err) {
      if (err.isStockIssue) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  }
}

module.exports = new OrderController();
