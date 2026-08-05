const usersService = require('./users.service');

const usersController = {
  async getAllUsers(req, res) {
    try {
      const users = await usersService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = usersController;