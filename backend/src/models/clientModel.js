const db = require('../config/db');

class ClientModel {
  // Used within transactions, receives a client
  async create(name, phone, client) {
    const result = await client.query(
      `INSERT INTO clients (name, phone) VALUES ($1, $2) RETURNING id`,
      [name, phone || null]
    );
    return result.rows[0].id;
  }
}

module.exports = new ClientModel();
