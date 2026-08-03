function createBooksController(booksService) {
  return {
    async listBooks(req, res) {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await booksService.listBooks(page, limit);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    async searchBooks(req, res) {
      try {
        const query = req.query.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await booksService.searchBooks(query, page, limit);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    async getBookById(req, res) {
      try {
        const book = await booksService.getBookById(req.params.id);
        res.json(book);
      } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
      }
    },

    async createBook(req, res) {
      try {
        const book = await booksService.createBook(req.body);
        res.status(201).json(book);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    async updateBook(req, res) {
      try {
        const book = await booksService.updateBook(req.params.id, req.body);
        res.json(book);
      } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
      }
    },

    async deleteBook(req, res) {
      try {
        await booksService.deleteBook(req.params.id);
        res.sendStatus(204);
      } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
      }
    }
  };
}

module.exports = { createBooksController };
