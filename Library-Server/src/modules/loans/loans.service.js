const db = require('../database.config');

const loansService = {
  // 1. User requests the book
  async requestBook(userId, bookId) {
    const connection = await db.getConnection();
    try {
      // Start the secure transaction
      await connection.beginTransaction();

      // Check whether the book exists and has copies
      // The 'FOR UPDATE' lock temporarily blocks the row to prevent two users from requesting the last copy at the same time (Concurrency)
      const [books] = await connection.query('SELECT available_copies FROM Books WHERE id = ? FOR UPDATE', [bookId]);
      
      if (books.length === 0) throw new Error('Book not found');
      if (books[0].available_copies <= 0) throw new Error('No copies available for this book');

      // Step 1: Remove 1 available copy
      await connection.query('UPDATE Books SET available_copies = available_copies - 1 WHERE id = ?', [bookId]);

      // Step 2: Create a record with status 'pending'
      const [result] = await connection.query(
        `INSERT INTO loans (user_id, book_id, status) VALUES (?, ?, 'pending')`,
        [userId, bookId]
      );

      // Everything went well, so save the changes!
      await connection.commit();
      return { id: result.insertId, message: 'Book requested successfully. Wait for Admin approval.' };
    } catch (error) {
      // If something failed, roll everything back!
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async getAllLoans(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM loans');
    const totalItems = countResult[0].total;

    const [rows] = await db.query(
      `SELECT l.id, l.status, l.request_date, l.loan_date, l.due_date, b.title, u.username as user_name, u.email as user_email
       FROM loans l
       JOIN Books b ON l.book_id = b.id
       JOIN users u ON l.user_id = u.id
       ORDER BY l.request_date DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return {
      data: rows,
      meta: { total: totalItems, page, last_page: Math.ceil(totalItems / limit) }
    };
  },

  async searchLoans(query, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const searchTerm = `%${query}%`;

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total 
       FROM loans l
       JOIN Books b ON l.book_id = b.id
       JOIN users u ON l.user_id = u.id
       WHERE b.title LIKE ? OR u.username LIKE ? OR u.email LIKE ?`,
      [searchTerm, searchTerm, searchTerm]
    );
    const totalItems = countResult[0].total;

    const [rows] = await db.query(
      `SELECT l.id, l.status, l.request_date, l.loan_date, l.due_date, b.title, u.username as user_name, u.email as user_email
       FROM loans l
       JOIN Books b ON l.book_id = b.id
       JOIN users u ON l.user_id = u.id
       WHERE b.title LIKE ? OR u.username LIKE ? OR u.email LIKE ?
       ORDER BY l.request_date DESC
       LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, searchTerm, limit, offset]
    );

    return {
      data: rows,
      meta: { total: totalItems, page, last_page: Math.ceil(totalItems / limit) }
    };
  },

  // Admin approves the loan (gives 14 days to return it)
  async approveLoan(loanId) {
    const [result] = await db.query(
      `UPDATE loans 
       SET status = 'active', 
           loan_date = CURRENT_TIMESTAMP, 
           due_date = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 14 DAY) 
       WHERE id = ? AND status = 'pending'`,
      [loanId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Loan not found or already processed');
    }
    return { message: 'Loan approved successfully' };
  },

  async rejectLoan(loanId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Find out which book belongs to this request
      const [loans] = await connection.query('SELECT book_id FROM loans WHERE id = ?', [loanId]);
      
      if (loans.length === 0) throw new Error('Loan request not found');
      const bookId = loans[0].book_id;

      // Change the loan status to 'rejected'
      await connection.query(`UPDATE loans SET status = 'rejected' WHERE id = ?`, [loanId]);

      // RETURN THE COPY TO THE SHELF (Super Important!)
      await connection.query('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?', [bookId]);

      // Save all changes
      await connection.commit();
      return { message: 'Loan rejected and book returned to available stock' };
      
    } catch (error) {
      // If anything fails, revert all changes
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // 3. Admin records the book return
  async returnBook(loanId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Find which book belongs to this loan
      const [loans] = await connection.query('SELECT book_id FROM loans WHERE id = ? AND status = ?', [loanId, 'active']);
      if (loans.length === 0) throw new Error('Active loan not found');
      
      const bookId = loans[0].book_id;

      // Step 1: Mark it as returned
      await connection.query(
        `UPDATE loans SET status = 'returned', return_date = CURRENT_TIMESTAMP WHERE id = ?`,
        [loanId]
      );

      // give back the book to the library (increment available copies)
      await connection.query('UPDATE Books SET available_copies = available_copies + 1 WHERE id = ?', [bookId]);

      await connection.commit();
      return { message: 'Book returned successfully' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // 4. View the user's own loans (for the dashboard)
  async getUserLoans(userId) {
    const [rows] = await db.query(
      `SELECT l.id, l.status, l.request_date, l.due_date, b.title, b.author 
       FROM loans l
       JOIN Books b ON l.book_id = b.id
       WHERE l.user_id = ?
       ORDER BY l.request_date DESC`,
      [userId]
    );
    return rows;
  },
  
  // See which books IDS the user has borrowed 
  async getbookLoans(userId) {
    const [rows] = await db.query(
      `SELECT book_id FROM loans WHERE user_id = ? AND status NOT IN ('returned', 'rejected')`,
      [userId]
    );
    return rows;
  },

  // 5. Admin sees all pending reservations
  async getPendingRequests() {
    const [rows] = await db.query(
      `SELECT l.id, l.request_date, u.username, u.email, b.title 
       FROM loans l
       JOIN users u ON l.user_id = u.id
       JOIN Books b ON l.book_id = b.id
       WHERE l.status = 'pending'
       ORDER BY l.request_date ASC`
    );
    return rows;
  }
};

module.exports = loansService;