const db = require('../database.config');

const loansService = {
  // 1. User requisita o livro
  async requestBook(userId, bookId) {
    const connection = await db.getConnection();
    try {
      // Inicia a transação de segurança
      await connection.beginTransaction();

      // Verifica se o livro existe e tem cópias
      // O 'FOR UPDATE' bloqueia a linha temporariamente para evitar que 2 users requisitem o último livro ao mesmo tempo (Concurrency)
      const [books] = await connection.query('SELECT available_copies FROM Books WHERE id = ? FOR UPDATE', [bookId]);
      
      if (books.length === 0) throw new Error('Book not found');
      if (books[0].available_copies <= 0) throw new Error('No copies available for this book');

      // 1º Passo: Retirar 1 cópia disponível
      await connection.query('UPDATE Books SET available_copies = available_copies - 1 WHERE id = ?', [bookId]);

      // 2º Passo: Criar o registo com estado 'pending'
      const [result] = await connection.query(
        `INSERT INTO loans (user_id, book_id, status) VALUES (?, ?, 'pending')`,
        [userId, bookId]
      );

      // Tudo correu bem, guarda as alterações!
      await connection.commit();
      return { id: result.insertId, message: 'Book requested successfully. Wait for Admin approval.' };
    } catch (error) {
      // Se algo falhou, reverte tudo!
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // 2. Admin aprova o empréstimo (Dá 14 dias para devolver)
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
    const [result] = await db.query(
      `UPDATE loans 
       SET status = 'rejected' 
       WHERE id = ? AND status = 'pending'`,
      [loanId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Loan not found or already processed');
    }
    return { message: 'Loan rejected successfully' };
  },

  // 3. Admin regista a devolução do livro
  async returnBook(loanId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Encontra qual foi o livro deste empréstimo
      const [loans] = await connection.query('SELECT book_id FROM loans WHERE id = ? AND status = ?', [loanId, 'active']);
      if (loans.length === 0) throw new Error('Active loan not found');
      
      const bookId = loans[0].book_id;

      // 1º Passo: Marca como devolvido
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

  // 4. Ver os empréstimos do próprio User (Para a Dashboard)
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

  // 5. Admin vê todas as reservas pendentes
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