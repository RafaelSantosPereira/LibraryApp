import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserLoan } from '../models/loan.model'; // Ajusta o caminho

@Injectable({
  providedIn: 'root'
})
export class LoansService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/loans';

  // --- SIGNALS DE ESTADO ---
  
  // Apenas IDs (Para esconder o botão "Request" na tabela)
  private privateBookLoans = signal<number[]>([]);
  public currentBookLoans = this.privateBookLoans.asReadonly();

  // Objetos completos (Para renderizar os cartões na Dashboard)
  private privateUserLoans = signal<UserLoan[]>([]);
  public userLoans = this.privateUserLoans.asReadonly();


  // --- ROTAS DE UTILIZADOR ---

  requestBook(bookId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, { bookId }, { withCredentials: true }).pipe(
      tap({
        next: () => {
          this.privateBookLoans.update(loans => [...loans, bookId]);
        }
      })
    );
  }

  getBookLoans(): Observable<any> {
    return this.http.get<{book_id: number}[]>(`${this.apiUrl}/book-loans`, { withCredentials: true }).pipe(
      tap({
        next: (response) => {
          const extractedIds = response.map(item => item.book_id);
          this.privateBookLoans.set(extractedIds);
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


  // --- ROTAS DE ADMIN ---

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

            this.privateBookLoans.update(loans => loans.filter(id => id !== loanId));
          }
        })
      );
    }
}