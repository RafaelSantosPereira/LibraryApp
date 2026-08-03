const express = require('express');

function createAuthRouter(controller, authenticateToken) {
  const router = express.Router();

  router.post('/login', controller.login);
  router.get('/me', authenticateToken, controller.getCurrentUser);
  router.post('/signup', controller.signup);
  router.post('/logout', controller.logout);

  return router;
}

module.exports = { createAuthRouter };
