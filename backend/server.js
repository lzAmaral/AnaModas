const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// --- Products API ---
app.get('/api/products', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM products';
    let params = [];
    if (search) {
      query += ' WHERE name ILIKE $1 OR code ILIKE $1';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY category, size';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { code, name, category, size, price, stock_quantity } = req.body;
    const query = `INSERT INTO products (code, name, category, size, price, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    const result = await db.query(query, [code, name, category, size, price, stock_quantity]);
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { code, name, category, size, price, stock_quantity } = req.body;
    const query = `UPDATE products SET code=$1, name=$2, category=$3, size=$4, price=$5, stock_quantity=$6 WHERE id=$7`;
    const result = await db.query(query, [code, name, category, size, price, stock_quantity, req.params.id]);
    res.json({ updated: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ deleted: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Orders API ---
app.get('/api/orders', async (req, res) => {
  try {
    const { status, date, search } = req.query;
    
    let query = `
      SELECT 
        o.id, o.total_amount, o.status, o.payment_status, o.order_date,
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
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const orderResult = await db.query(`
      SELECT o.*, c.name as client_name, c.phone as client_phone 
      FROM orders o 
      LEFT JOIN clients c ON o.client_id = c.id 
      WHERE o.id = $1
    `, [orderId]);

    const order = orderResult.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const itemsResult = await db.query(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);
    
    order.items = itemsResult.rows;
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pendente', 'separado', 'entregue'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const result = await db.query(`UPDATE orders SET status = $1 WHERE id = $2`, [status, req.params.id]);
    res.json({ updated: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/payment', async (req, res) => {
  try {
    const { payment_status } = req.body;
    if (!['pago', 'não pago'].includes(payment_status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }
    const result = await db.query(`UPDATE orders SET payment_status = $1 WHERE id = $2`, [payment_status, req.params.id]);
    res.json({ updated: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Restore stock
    const itemsResult = await client.query(`SELECT product_id, quantity FROM order_items WHERE order_id = $1`, [orderId]);
    const items = itemsResult.rows;

    for (const item of items) {
      await client.query(`UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2`, [item.quantity, item.product_id]);
    }

    const deleteResult = await client.query('DELETE FROM orders WHERE id = $1', [orderId]);
    await client.query('COMMIT');
    res.json({ deleted: deleteResult.rowCount });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.post('/api/orders', async (req, res) => {
  const { client_name, client_phone, items } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must have items' });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    let clientId;
    const clientResult = await client.query(
      `INSERT INTO clients (name, phone) VALUES ($1, $2) RETURNING id`,
      [client_name, client_phone || null]
    );
    clientId = clientResult.rows[0].id;

    // We will update the total_amount at the end after validating all items with DB prices
    const orderResult = await client.query(
      `INSERT INTO orders (client_id, total_amount, status, payment_status) VALUES ($1, $2, $3, $4) RETURNING id`, 
      [clientId, 0, 'pendente', 'não pago']
    );
    const orderId = orderResult.rows[0].id;

    let calculatedTotalAmount = 0;

    for (const item of items) {
      const productResult = await client.query(`SELECT price, stock_quantity FROM products WHERE id = $1`, [item.product_id]);
      const product = productResult.rows[0];

      if (!product || product.stock_quantity < item.quantity) {
        throw new Error(`Not enough stock for product ID: ${item.product_id}. Available: ${product ? product.stock_quantity : 0}`);
      }

      const dbUnitPrice = Number(product.price);
      const dbTotalPrice = dbUnitPrice * item.quantity;
      calculatedTotalAmount += dbTotalPrice;

      await client.query(`UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`, [item.quantity, item.product_id]);

      await client.query(
        `INSERT INTO order_items (order_id, product_id, size, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5, $6)`, 
        [orderId, item.product_id, item.size || '', item.quantity, dbUnitPrice, dbTotalPrice]
      );
    }

    // Update the final order total amount
    await client.query(`UPDATE orders SET total_amount = $1 WHERE id = $2`, [calculatedTotalAmount, orderId]);
    
    await client.query('COMMIT');
    res.json({ id: orderId, total_amount: calculatedTotalAmount });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(err.message.includes('stock') ? 400 : 500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// --- Dashboard API ---
app.get('/api/dashboard', async (req, res) => {
  try {
    const result = {
      total_orders: 0,
      total_revenue: 0,
      low_stock_products: [],
      top_products: []
    };

    const statsResult = await db.query(`SELECT COUNT(id) as total_orders, COALESCE(SUM(total_amount), 0) as total_revenue FROM orders`);
    result.total_orders = parseInt(statsResult.rows[0].total_orders, 10);
    result.total_revenue = parseFloat(statsResult.rows[0].total_revenue);

    const lowStockResult = await db.query(`SELECT id, name, size, stock_quantity FROM products WHERE stock_quantity <= 5 ORDER BY stock_quantity ASC`);
    result.low_stock_products = lowStockResult.rows;
    
    const topProductsResult = await db.query(`
      SELECT p.id, p.name, SUM(oi.quantity) as sold_quantity 
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.id
      ORDER BY sold_quantity DESC
      LIMIT 5
    `);
    result.top_products = topProductsResult.rows.map(row => ({
      ...row,
      sold_quantity: parseInt(row.sold_quantity, 10)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
