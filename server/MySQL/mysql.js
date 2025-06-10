const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'artiq_db',
  waitForConnections: true,
  connectionLimit: 250,
  queueLimit: 0
});

module.exports = pool;