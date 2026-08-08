const loansService = require('./loans.service');

const loansController = {
  async requestBook(req, res) {
    try {
      // req.user.id vem do authenticateToken middleware!
      const userId = req.user.id; 
      const { bookId } = req.body;
      
      const result = await loansService.requestBook(userId, bookId);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async approveLoan(req, res) {
    try {
      const result = await loansService.approveLoan(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async returnBook(req, res) {
    try {
      const result = await loansService.returnBook(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getUserLoans(req, res) {
    try {
      const result = await loansService.getUserLoans(req.user.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getbookLoans(req, res) {
    try {
      const result = await loansService.getbookLoans(req.user.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getPendingRequests(req, res) {
    try {
      const result = await loansService.getPendingRequests();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = loansController;