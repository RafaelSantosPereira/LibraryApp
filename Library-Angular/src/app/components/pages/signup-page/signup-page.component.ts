import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';



import { 
  ReactiveFormsModule, 
  FormGroup, 
  FormControl, 
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select'; 
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule
  ],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.scss'
})
export class SignupPageComponent {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);




  hidePassword = true;
  hideConfirmPassword = true;

  signupForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
    role: new FormControl('user', [Validators.required])
    
  }, { validators: this.passwordMatchValidator }); 

  onSubmit() {
  if (this.signupForm.valid) {
    const formValue = this.signupForm.value;
    console.log(formValue);

    const user = {
      username: formValue.name as string,
      email: formValue.email as string,
      password: formValue.password as string,
      role: formValue.role as string 
    };
    this.authService.signup(user).subscribe({
      next: (response) => {
        console.log(response);
        this.snackBar.open(response.message, 'Close', {
          duration: 4000,// 4 segundos
          panelClass: ['success-snackbar'],
          verticalPosition: 'top'
        });

        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.signupForm.reset();
  }
}

  // Validador Personalizado
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      // Se corrigiu, removemos o erro de mismatch (mas mantemos outros erros como 'required' se existirem)
      const confirmControl = control.get('confirmPassword');
      if (confirmControl?.hasError('mismatch')) {
        delete confirmControl.errors?.['mismatch'];
        // Se não sobrarem erros, definimos como null para ficar válido
        if (!Object.keys(confirmControl.errors || {}).length) {
          confirmControl.setErrors(null);
        }
      }
      return null;
    }
  }
}