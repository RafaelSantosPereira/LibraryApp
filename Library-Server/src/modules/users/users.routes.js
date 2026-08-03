const express = require('express');

function createUsersRouter(controller, authenticateToken, isAdmin) {
  const router = express.Router();

  router.get('/', authenticateToken, isAdmin, controller.getAllUsers);

  return router;
}

module.exports = { createUsersRouter };
