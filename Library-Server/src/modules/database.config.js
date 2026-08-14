const mysql = require('mysql2/promise');
require('dotenv').config(); // Ensures environment variables are loaded here immediately

// Create the connection pool only once
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the pool so it can be imported directly in any file
module.exports = db;