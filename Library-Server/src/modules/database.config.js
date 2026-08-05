const mysql = require('mysql2/promise');
require('dotenv').config(); // Garante que lê as variáveis de ambiente logo aqui

// Criamos a pool de conexões uma única vez
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Exportamos a pool para poder ser importada diretamente em qualquer ficheiro
module.exports = db;