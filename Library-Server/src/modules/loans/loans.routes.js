const express = require('express');
const loansController = require('./loans.controller');
const { authenticateToken, isAdmin } = require('../auth/auth-midlewere');

const router = express.Router();

// User routes
router.post('/request', authenticateToken, loansController.requestBook);
router.get('/my-loans', authenticateToken, loansController.getUserLoans);
router.get('/book-loans', authenticateToken, loansController.getbookLoans);

// Admin routes
router.get('/pending', authenticateToken, isAdmin, loansController.getPendingRequests);
router.put('/:id/approve', authenticateToken, isAdmin, loansController.approveLoan);
router.put('/:id/return', authenticateToken, isAdmin, loansController.returnBook);

module.exports = router;