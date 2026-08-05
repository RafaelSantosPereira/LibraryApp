const express = require('express');
const booksController = require('./books.controller');
const { authenticateToken, isAdmin } = require('../auth/auth-midlewere');

const router = express.Router();

router.get('/', booksController.listBooks);
router.get('/search', booksController.searchBooks);
router.get('/:id', booksController.getBookById);
router.post('/', authenticateToken, isAdmin, booksController.createBook);
router.put('/:id', authenticateToken, isAdmin, booksController.updateBook);
router.delete('/:id', authenticateToken, isAdmin, booksController.deleteBook);

module.exports = router;