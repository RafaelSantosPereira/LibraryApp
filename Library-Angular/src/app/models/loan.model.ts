export interface UserLoan {
  id: number;
  status: 'pending' | 'active' | 'returned' | 'overdue' | 'rejected';
  request_date: string;
  loan_date: string | null; // NEW
  due_date: string | null;
  title: string;
  author: string;
}

export interface Loan {
  id: number;
  user_name: string;
  user_email: string;
  status: 'pending' | 'active' | 'returned' | 'overdue' | 'rejected';
  request_date: string;
  loan_date: string | null; // NEW
  due_date: string | null;
  title: string;
  display_date?: string;    // NEW: Used by the table to show the correct date dynamically
}