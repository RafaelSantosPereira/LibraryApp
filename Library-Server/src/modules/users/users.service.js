function createUsersService(db) {
  return {
    async getAllUsers() {
      const [rows] = await db.query('SELECT id, username, email, role FROM users');
      return rows;
    }
  };
}

module.exports = { createUsersService };
