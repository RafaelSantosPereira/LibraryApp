const express = require('express');
const authController = require('./auth.controller');
const { authenticateToken } = require('./auth-midlewere'); // <-- IMPORT DOS MIDDLEWARES

const router = express.Router();

router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/signup', authController.signup);
router.post('/logout', authController.logout);

module.exports = router;