const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');
const { createAuthService } = require('./modules/auth/auth.service');
const { createAuthController } = require('./modules/auth/auth.controller');
const { createAuthRouter } = require('./modules/auth/auth.routes');
const { createBooksService } = require('./modules/books/books.service');
const { createBooksController } = require('./modules/books/books.controller');
const { createBooksRouter } = require('./modules/books/books.routes');
const { createUsersService } = require('./modules/users/users.service');
const { createUsersController } = require('./modules/users/users.controller');
const { createUsersRouter } = require('./modules/users/users.routes');
const jwt = require('jsonwebtoken');

function createApp() {
  const app = express();

  app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
  }));

  app.use(express.json());
  app.use(cookieParser());

  const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. Please log in.' });
    }

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
      next();
    } catch (err) {
      res.status(403).json({ error: 'Invalid or expired token.' });
    }
  };

  const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden access. Administrators only.' });
    }
  };

  const authService = createAuthService(db);
  const authController = createAuthController(authService);
  const authRouter = createAuthRouter(authController, authenticateToken);

  const booksService = createBooksService(db);
  const booksController = createBooksController(booksService);
  const booksRouter = createBooksRouter(booksController, authenticateToken, isAdmin);

  const usersService = createUsersService(db);
  const usersController = createUsersController(usersService);
  const usersRouter = createUsersRouter(usersController, authenticateToken, isAdmin);

  app.use('/auth', authRouter);
  app.use('/books', booksRouter);
  app.use('/users', usersRouter);

  return app;
}

module.exports = { createApp };
