const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// 1. IMPORTAR APENAS AS ROTAS! Muito mais limpo.
const authRouter = require('./modules/auth/auth.routes');
const booksRouter = require('./modules/books/books.routes');
const usersRouter = require('./modules/users/users.routes');
const loansRouter = require('./modules/loans/loans.routes');

function createApp() {
  const app = express();

  app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
  }));

  app.use(express.json());
  app.use(cookieParser());

  // 2. REGISTAR AS ROTAS
  app.use('/auth', authRouter);
  app.use('/books', booksRouter);
  app.use('/users', usersRouter);
  app.use('/loans', loansRouter);

  return app;
}

module.exports = { createApp };