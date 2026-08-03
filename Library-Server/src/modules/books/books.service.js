function createBooksService(db) {
  return {
    async listBooks(page = 1, limit = 10) {
      const offset = (page - 1) * limit;
      const [countResult] = await db.query('SELECT COUNT(*) as total FROM Books');
      const totalItems = countResult[0].total;
      const [rows] = await db.query('SELECT * FROM Books LIMIT ? OFFSET ?', [limit, offset]);

      return {
        data: rows,
        meta: {
          total: totalItems,
          page,
          last_page: Math.ceil(totalItems / limit)
        }
      };
    },

    async searchBooks(query, page = 1, limit = 10) {
      const offset = (page - 1) * limit;
      const searchTerm = `%${query}%`;

      const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM Books
         WHERE title LIKE ? OR author LIKE ? OR category LIKE ?`,
        [searchTerm, searchTerm, searchTerm]
      );
      const totalItems = countResult[0].total;

      const [rows] = await db.query(
        `SELECT * FROM Books
         WHERE title LIKE ? OR author LIKE ? OR category LIKE ?
         LIMIT ? OFFSET ?`,
        [searchTerm, searchTerm, searchTerm, limit, offset]
      );

      return {
        data: rows,
        meta: {
          total: totalItems,
          page,
          last_page: Math.ceil(totalItems / limit)
        }
      };
    },

    async getBookById(bookId) {
      const [bookInfo] = await db.query('SELECT * FROM Books WHERE id = ?', [bookId]);
      if (bookInfo.length === 0) {
        const error = new Error('Book not found');
        error.statusCode = 404;
        throw error;
      }

      return bookInfo[0];
    },

    async createBook(payload) {
      const { title, author, year, category, total_copies = 1 } = payload;
      const [result] = await db.query(
        `INSERT INTO Books (title, author, year, category, total_copies, available_copies)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, author, year, category, total_copies, total_copies]
      );

      const [newBook] = await db.query('SELECT * FROM Books WHERE id = ?', [result.insertId]);
      return newBook[0];
    },

    async updateBook(bookId, payload) {
      const { title, author, year, category, total_copies, available_copies } = payload;
      const [existingBook] = await db.query('SELECT * FROM Books WHERE id = ?', [bookId]);

      if (existingBook.length === 0) {
        const error = new Error('Book not found');
        error.statusCode = 404;
        throw error;
      }

      await db.query(
        `UPDATE Books SET title = ?, author = ?, year = ?, category = ?, total_copies = ?, available_copies = ? WHERE id = ?`,
        [title, author, year, category, total_copies, available_copies, bookId]
      );

      const [updatedBook] = await db.query('SELECT * FROM Books WHERE id = ?', [bookId]);
      return updatedBook[0];
    },

    async deleteBook(bookId) {
      const [result] = await db.query('DELETE FROM Books WHERE id = ?', [bookId]);
      if (result.affectedRows === 0) {
        const error = new Error('Book not found');
        error.statusCode = 404;
        throw error;
      }

      return true;
    }
  };
}

module.exports = { createBooksService };
