import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);


  const token = localStorage.getItem('auth_token');
  const userDataString = localStorage.getItem('user_data');

  // 2. Verificar se tem token e dados de user
  if (token && userDataString) {
    try {
      const user = JSON.parse(userDataString);

      if (user.role === 'admin') {
        return true; // PERMITIR ACESSO
      }
    } catch (e) {
      console.error('Erro ao ler dados do utilizador', e);
    }
  }

  // 4. Se falhar alguma verificação acima:
  snackBar.open('Acesso Negado: Apenas para Administradores.', 'OK', {
    duration: 5000,
    panelClass: ['error-snackbar'],
    verticalPosition: 'top'
  });


  if (token) {
    router.navigate(['/books']);
  } else {
    router.navigate(['/login']);
  }
  
  return false; // BLOQUEAR ACESSO
};