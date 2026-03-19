const db = require('../config/db');

class ProductModel {
  async getAll(search) {
    let query = 'SELECT * FROM products';
    let params = [];
    if (search) {
      query += ' WHERE name ILIKE $1 OR code ILIKE $1';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY category, size';
    const result = await db.query(query, params);
    return result.rows;
  }

  async create({ code, name, category, size, price, stock_quantity }) {
    const query = `INSERT INTO products (code, name, category, size, price, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    const result = await db.query(query, [code, name, category, size, price, stock_quantity]);
    return result.rows[0];
  }

  async update(id, { code, name, category, size, price, stock_quantity }) {
    const query = `UPDATE products SET code=$1, name=$2, category=$3, size=$4, price=$5, stock_quantity=$6 WHERE id=$7`;
    const result = await db.query(query, [code, name, category, size, price, stock_quantity, id]);
    return result.rowCount;
  }

  async delete(id) {
    const result = await db.query('DELETE FROM products WHERE id = $1', [id]);
    return result.rowCount;
  }

  async getLowStock(limit = 5) {
    const result = await db.query(`SELECT id, name, size, stock_quantity FROM products WHERE stock_quantity <= $1 ORDER BY stock_quantity ASC`, [limit]);
    return result.rows;
  }

  async getTopProducts(limit = 5) {
    const result = await db.query(`
      SELECT p.id, p.name, SUM(oi.quantity) as sold_quantity 
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.id
      ORDER BY sold_quantity DESC
      LIMIT $1
    `, [limit]);
    return result.rows;
  }

  // Used within transactions, receives a client
  async checkStock(id, client) {
    const result = await client.query(`SELECT price, stock_quantity FROM products WHERE id = $1`, [id]);
    return result.rows[0];
  }

  async adjustStock(id, quantity, client) {
    await client.query(`UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2`, [quantity, id]);
  }
}

module.exports = new ProductModel();
