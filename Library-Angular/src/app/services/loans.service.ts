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

  // only IDs (For the table)
  private privateBookLoans = signal<number[]>([]);
  public currentBookLoans = this.privateBookLoans.asReadonly();

  // - Full loan objects (For the dashboard)
  private privateUserLoans = signal<UserLoan[]>([]);
  public userLoans = this.privateUserLoans.asReadonly();

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

}