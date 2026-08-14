import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { LoansService } from './loans.service';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

// Create this new interface for signup
export interface SignupUser {
  username: string;
  email: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private loansService = inject(LoansService);
  private apiUrl = 'http://localhost:3000';

  currentUser = signal<User | null>(null);

  signup(user: SignupUser) {
    return this.httpClient.post<{message: string}>(`${this.apiUrl}/auth/signup`, user);
  }

  login(email: string, password: string) {
    return this.httpClient.post<{message: string, user: User}>(
      `${this.apiUrl}/auth/login`, 
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.currentUser.set(response.user);
      })
    );
  }

  logout() {
    return this.httpClient.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.loansService.clearLoans();
      })
    );
  }

  fetchCurrentUser() {
    return this.httpClient.get<{user: User}>(`${this.apiUrl}/auth/me`, { withCredentials: true }).pipe(
      tap(response => {
        this.currentUser.set(response.user);
      }),
      catchError(() => {
        this.currentUser.set(null);
        return of(null); 
      })
    );
  }
  isLoggedIn() {
    return this.currentUser() !== null;
  }
  isAdmin() {
    const user = this.currentUser();
    return user?.role === 'admin';
  }
}