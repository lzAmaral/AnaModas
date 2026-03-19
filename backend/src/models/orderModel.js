const db = require('../config/db');

class OrderModel {
  async getAll(status, date, search) {
    let query = `
      SELECT 
        o.id, o.total_amount, o.status, o.payment_status, o.order_date, o.notes,
        c.name as client_name, c.phone as client_phone
      FROM orders o
      LEFT JOIN clients c ON o.client_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND o.status = $${paramIndex++}`;
      params.push(status);
    }
    if (date) {
      query += ` AND DATE(o.order_date) = $${paramIndex++}`;
      params.push(date);
    }
    if (search) {
      query += ` AND (c.name ILIKE $${paramIndex} OR c.phone ILIKE $${paramIndex} OR o.id::text ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY o.order_date DESC`;
    const result = await db.query(query, params);
    return result.rows;
  }

  async getById(id) {
    const orderResult = await db.query(`
      SELECT o.*, c.name as client_name, c.phone as client_phone 
      FROM orders o 
      LEFT JOIN clients c ON o.client_id = c.id 
      WHERE o.id = $1
    `, [id]);

    const order = orderResult.rows[0];
    if (!order) return null;

    const itemsResult = await db.query(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);

    order.items = itemsResult.rows;
    return order;
  }

  async updateStatus(id, status) {
    const result = await db.query(`UPDATE orders SET status = $1 WHERE id = $2`, [status, id]);
    return result.rowCount;
  }

  async updatePaymentStatus(id, paymentStatus) {
    const result = await db.query(`UPDATE orders SET payment_status = $1 WHERE id = $2`, [paymentStatus, id]);
    return result.rowCount;
  }

  async getStats() {
    const statsResult = await db.query(`SELECT COUNT(id) as total_orders, COALESCE(SUM(total_amount), 0) as total_revenue FROM orders`);
    return {
      total_orders: parseInt(statsResult.rows[0].total_orders, 10),
      total_revenue: parseFloat(statsResult.rows[0].total_revenue)
    };
  }

  // Used within transactions, receives a client
  async getItemsByOrderId(orderId, client) {
    const itemsResult = await client.query(`SELECT product_id, quantity FROM order_items WHERE order_id = $1`, [orderId]);
    return itemsResult.rows;
  }

  async delete(orderId, client) {
    const result = await client.query('DELETE FROM orders WHERE id = $1', [orderId]);
    return result.rowCount;
  }

  async create(clientId, notes, client) {
    const result = await client.query(
      `INSERT INTO orders (client_id, total_amount, status, payment_status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id`, 
      [clientId, 0, 'pendente', 'não pago', notes || null]
    );
    return result.rows[0].id;
  }

  async updateTotalAmount(orderId, amount, client) {
    await client.query(`UPDATE orders SET total_amount = $1 WHERE id = $2`, [amount, orderId]);
  }

  async createItem(orderId, productId, size, quantity, unitPrice, totalPrice, client) {
    await client.query(
      `INSERT INTO order_items (order_id, product_id, size, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5, $6)`, 
      [orderId, productId, size || '', quantity, unitPrice, totalPrice]
    );
  }
}

module.exports = new OrderModel();
