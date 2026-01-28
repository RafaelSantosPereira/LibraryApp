import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  hidePassword = true;

  onLogin() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      
      // TODO: Chamar serviço de autenticação
      console.log('Login data:', loginData);
      
      // Simula login bem-sucedido
      // this.authService.login(loginData).subscribe({
      //   next: (response) => {
      //     this.router.navigate(['/books']);
      //   },
      //   error: (err) => {
      //     console.error('Login error:', err);
      //   }
      // });
    }
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}