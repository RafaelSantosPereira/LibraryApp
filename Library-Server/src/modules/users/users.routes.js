const express = require('express');
const usersController = require('./users.controller');
const { authenticateToken, isAdmin } = require('../auth/auth-midlewere');

const router = express.Router();

router.get('/', authenticateToken, isAdmin, usersController.getAllUsers);

module.exports = router;