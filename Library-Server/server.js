require('dotenv').config(); 
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Teste de conexão
async function checkConnection() {
  try {
    const connection = await db.getConnection();
    console.log(`Conectado à BD: ${process.env.DB_NAME}`);
    connection.release();
  } catch (err) {
    console.error('Erro de conexão:', err.message);
  }
}

checkConnection();


app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query(
            `SELECT u.id, u.username, u.role, u.email, a.password_hash 
             FROM users u
             JOIN user_auth a ON u.id = a.user_id
             WHERE u.email = ?`, 
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h' }
        );

        await db.query('UPDATE user_auth SET last_login = NOW() WHERE user_id = ?', [user.id]);

        res.json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/auth/signup', async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        
        const [userResult] = await connection.query(
            'INSERT INTO users (username, email, role) VALUES (?, ?, ?)',
            [username, email, role]
        );
        
        const newUserId = userResult.insertId;
        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.query(
            'INSERT INTO user_auth (user_id, password_hash) VALUES (?, ?)',
            [newUserId, hashedPassword]
        );

        await connection.commit();
        res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        await connection.rollback();

        if (err.code === 'ER_DUP_ENTRY') {
            if (err.message.includes('email')) {
                return res.status(409).json({ message: "Email already exists" });
            }
        }

        console.error("Signup error:", err);
        res.status(500).json({ error: "Internal Server Error" });

    } finally {
        connection.release();
    }
});

app.get('/books', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM Books');
    const totalItems = countResult[0].total;

    const [rows] = await db.query('SELECT * FROM Books LIMIT ? OFFSET ?', [limit, offset]);
    
    res.json({
      data: rows,
      meta: {
        total: totalItems,
        page: page,
        last_page: Math.ceil(totalItems / limit)
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get('/books/search', async (req, res) => {
  const query = req.query.query;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  console.log(` Pesquisa: "${query}" | Página: ${page} | Limite: ${limit}`);

  try {
    const searchTerm = `%${query}%`;

    // 1. Contar totais filtrados
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM Books 
       WHERE title LIKE ? OR author LIKE ? OR category LIKE ?`,
      [searchTerm, searchTerm, searchTerm]
    );
    const totalItems = countResult[0].total;

    // Buscar dados filtrados com limite e offset
    const [rows] = await db.query(
      `SELECT * FROM Books 
       WHERE title LIKE ? OR author LIKE ? OR category LIKE ?
       LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, searchTerm, limit, offset]
    );

    res.json({
      data: rows,
      meta: {
        total: totalItems,
        page: page,
        last_page: Math.ceil(totalItems / limit)
      }
    });
  } catch (err) {
    console.error("Erro na busca:", err);
    res.status(500).json({ error: err.message });
  }
});



app.post('/book', async (req, res) => {
  const { title, author, year, category, total_copies = 1 } = req.body;
  
  try {
    const [result] = await db.query(
      `INSERT INTO Books (title, author, year, category, total_copies, available_copies) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, author, year, category, total_copies, total_copies]
    );
    
    const [newBook] = await db.query(
      'SELECT * FROM Books WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newBook[0]); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('book/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    const [bookInfo] = await db.query('SELECT * FROM Books WHERE id = ?', [bookId]);
    if (bookInfo.length === 0) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }
    res.json(bookInfo[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/book/:id', async (req, res) => {
  const bookId = req.params.id;
  const { title, author, year, category, total_copies, available_copies } = req.body;
  try {
    const [existingBook] = await db.query('SELECT * FROM Books WHERE id = ?', [bookId]);    
    if (existingBook.length === 0) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }

    const [result] = await db.query(
      `UPDATE Books SET title = ?, author = ?, year = ?, category = ?, total_copies = ?, available_copies = ? WHERE id = ?`,
      [title, author, year, category, total_copies, available_copies, bookId]
    );

    const [updatedBook] = await db.query('SELECT * FROM Books WHERE id = ?', [bookId]);
    res.json(updatedBook[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor em http://localhost:${PORT}`);
});

app.delete('/book/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM Books WHERE id = ?', [bookId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }


});