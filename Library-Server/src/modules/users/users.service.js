const db = require('../database.config');

const usersService = {
  async getAllUsers() {
    const [rows] = await db.query('SELECT id, username, email, role FROM users');
    return rows;
  }
};

module.exports = usersService;