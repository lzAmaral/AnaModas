const { Pool } = require('pg');

const connectionString = 'postgresql://postgres.ezuwuughktgnvhyrtltd:P7Q8VJ8%24kj6%26_t4@aws-1-sa-east-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const initializeDB = async () => {
  try {
    const client = await pool.connect();
    
    // Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE,
        name TEXT NOT NULL,
        category TEXT,
        size TEXT,
        price NUMERIC(10, 2) NOT NULL,
        stock_quantity INTEGER NOT NULL DEFAULT 0
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'pendente',
        payment_status TEXT NOT NULL DEFAULT 'não pago',
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT,
        size TEXT,
        quantity INTEGER NOT NULL,
        unit_price NUMERIC(10, 2) NOT NULL,
        total_price NUMERIC(10, 2) NOT NULL
      )
    `);

    client.release();
    console.log('Connected to Supabase PostgreSQL database and tables verified.');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
};

initializeDB();

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
};
