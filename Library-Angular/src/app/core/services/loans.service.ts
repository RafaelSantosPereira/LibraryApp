import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserLoan, Loan } from '../../models/loan.model';

interface PaginatedLoansResponse {
  data: Loan[];
  meta: { total: number, page: number, last_page: number };
}

@Injectable({
  providedIn: 'root'
})
export class LoansService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/loans';

  // --- STATE SIGNALS ---
  
  // Only IDs (to hide the "Request" button in the table)
  private privateUserBookLoans = signal<number[]>([]);
  public currentUserBookLoans = this.privateUserBookLoans.asReadonly();

  // Full objects (to render the cards on the dashboard)
  private privateUserLoans = signal<UserLoan[]>([]);
  public userLoans = this.privateUserLoans.asReadonly();

  private privateAllLoans = signal<Loan[]>([]);
  public allLoans = this.privateAllLoans.asReadonly();

  public totalLoans = signal<number>(0);


  // --- USER ROUTES ---

  requestBook(bookId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, { bookId }, { withCredentials: true }).pipe(
      tap({
        next: () => {
          this.privateUserBookLoans.update(loans => [...loans, bookId]);
        }
      })
    );
  }

  getUserBookIdLoans(): Observable<any> {
    return this.http.get<{book_id: number}[]>(`${this.apiUrl}/book-loans`, { withCredentials: true }).pipe(
      tap({
        next: (response) => {
          const extractedIds = response.map(item => item.book_id);
          this.privateUserBookLoans.set(extractedIds);
        }
      })
    );
  }

  getUserLoans(): Observable<UserLoan[]> {
    return this.http.get<UserLoan[]>(`${this.apiUrl}/my-loans`, { withCredentials: true }).pipe(
      tap({
        next: (response) => {
          this.privateUserLoans.set(response);
        }
      })
    );
  }
  getAllLoans(page: number = 1, limit: number = 10): Observable<PaginatedLoansResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedLoansResponse>(`${this.apiUrl}/all`, { params, withCredentials: true }).pipe(
      tap({
        next: (response) => {
          this.privateAllLoans.set(response.data);
          this.totalLoans.set(response.meta.total);
        }
      })
    );
  }

  // NEW: Search loans with pagination
  searchLoans(query: string, page: number = 1, limit: number = 10): Observable<PaginatedLoansResponse> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedLoansResponse>(`${this.apiUrl}/search`, { params, withCredentials: true }).pipe(
      tap({
        next: (response) => {
          this.privateAllLoans.set(response.data);
          this.totalLoans.set(response.meta.total);
        }
      })
    );
  }


  // --- ADMIN ROUTES ---

  getPendingRequests(): Observable<UserLoan[]> {
    return this.http.get<UserLoan[]>(`${this.apiUrl}/pending`, { withCredentials: true });
  }

  approveLoan(loanId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${loanId}/approve`, {}, { withCredentials: true });
  }
  rejectLoan(loanId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${loanId}/reject`, {}, { withCredentials: true }).pipe(
      tap({
        next: () => {
          this.privateUserLoans.update(loans =>
            loans.map(loan =>
              loan.id === loanId ? { ...loan, status: 'rejected' } : loan
            )
          );
        }
      })
    );
  }

  returnBook(loanId: number): Observable<any> {
      return this.http.put(`${this.apiUrl}/${loanId}/return`, {}, { withCredentials: true }).pipe(
        tap({
          next: () => {
            this.privateUserLoans.update(loans =>
              loans.map(loan =>
                loan.id === loanId ? { ...loan, status: 'returned' } : loan
              )
            );

            this.privateUserBookLoans.update(loans => loans.filter(id => id !== loanId));
          }
        })
      );
    }

  clearLoans() {
    this.privateUserBookLoans.set([]);
    this.privateUserLoans.set([]);
  }
}