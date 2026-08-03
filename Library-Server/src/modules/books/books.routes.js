const express = require('express');

function createBooksRouter(controller, authenticateToken, isAdmin) {
  const router = express.Router();

  router.get('/', controller.listBooks);  // Public route to list all books
  router.get('/search', controller.searchBooks); // Public route to search for books
  router.get('/:id', controller.getBookById); // Public route to get a book by ID
  router.post('/', authenticateToken, isAdmin, controller.createBook); // Protected route to create a new book
  router.put('/:id', authenticateToken, isAdmin, controller.updateBook); // Protected route to update a book
  router.delete('/:id', authenticateToken, isAdmin, controller.deleteBook); // Protected route to delete a book

  return router;
}

module.exports = { createBooksRouter };
