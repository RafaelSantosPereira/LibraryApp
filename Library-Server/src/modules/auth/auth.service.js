const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database.config');

const authService = {
  async login(email, password) {
    const [users] = await db.query(
      `SELECT u.id, u.username, u.role, u.email, a.password_hash
       FROM users u
       JOIN user_auth a ON u.id = a.user_id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    await db.query('UPDATE user_auth SET last_login = NOW() WHERE user_id = ?', [user.id]);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  },

  async getCurrentUser(userId) {
    const [users] = await db.query(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return users[0];
  },

  async signup(username, email, password, role = 'user') {
    if (!username || !email || !password) {
      const error = new Error('All fields are required');
      error.statusCode = 400;
      throw error;
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [userResult] = await connection.query(
        'INSERT INTO users (username, email, role) VALUES (?, ?, ?)',
        [username, email, role]
      );

      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.query(
        'INSERT INTO user_auth (user_id, password_hash) VALUES (?, ?)',
        [userResult.insertId, hashedPassword]
      );

      await connection.commit();
      return { message: 'User registered successfully' };
    } catch (error) {
      await connection.rollback();

      if (error.code === 'ER_DUP_ENTRY') {
        const duplicateError = new Error('Email already exists');
        duplicateError.statusCode = 409;
        throw duplicateError;
      }

      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = authService;