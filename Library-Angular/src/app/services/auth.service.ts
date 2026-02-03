import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';

export interface User {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface loginResponse{
  message: string;
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  }
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private httpClient = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  constructor() { }

  signup(user: User) {
    const response = this.httpClient.post<{message: string}>(`${this.apiUrl}/auth/signup`, user);
    console.log(response)

    return response;
  }
  login(email: string, password: string) {
    const response = this.httpClient.post<loginResponse>(`${this.apiUrl}/auth/login`, {email, password}).pipe(tap({
      next: (response) => {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
      },
    }));
    console.log(response)

    return response;
  }
}
