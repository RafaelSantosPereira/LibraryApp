export interface UserLoan {
  id: number;
  status: 'pending' | 'active' | 'returned' | 'overdue' | 'rejected';
  request_date: string;
  due_date: string | null;
  title: string;
  author: string;
}