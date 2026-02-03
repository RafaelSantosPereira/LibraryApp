import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ErrorStateMatcher } from '@angular/material/core';


import { 
  ReactiveFormsModule, 
  FormGroup, 
  FormControl, 
  Validators,
  FormGroupDirective,
  NgForm
} from '@angular/forms';


// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

/** Error quando o controlo é inválido e está DIRTY (foi alterado) */
export class DirtyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && control.dirty);
  }
}


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
    MatIconModule,
    MatSnackBarModule

  ],
  providers: [
    { provide: ErrorStateMatcher, useClass: DirtyErrorStateMatcher }
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {

  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);



  hidePassword = true; 

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(5)])
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      console.log(formValue);

      const email = formValue.email as string;
      const password = formValue.password as string;
  
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.snackBar.open('Login successful! Welcome back.', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
            verticalPosition: 'top'
          });

          this.loginForm.reset();
          console.log(response);
          this.router.navigate(['/books']);
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Login failed. Please try again.';
              
          this.snackBar.open(errorMessage, 'OK', {
            duration: 5000,
            panelClass: ['error-snackbar'],
            verticalPosition: 'top'
          });

          console.error(err);
        }});
        

    
    }
  }
}