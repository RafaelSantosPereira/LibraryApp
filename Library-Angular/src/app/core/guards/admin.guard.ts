import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);

  const currentUser = authService.currentUser();
  if (currentUser) {
    return allowAdminOrRedirect(currentUser.role === 'admin');
  }

  return authService.fetchCurrentUser().pipe(
    map(userResponse => allowAdminOrRedirect(userResponse?.user?.role === 'admin')),
    catchError(() => of(router.createUrlTree(['/login'])))
  );

  function allowAdminOrRedirect(isAdmin: boolean) {
    if (isAdmin) {
      return true;
    }

    snackBar.open('Acesso Negado: Apenas para Administradores.', 'OK', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      verticalPosition: 'top'
    });

    return router.createUrlTree([authService.isLoggedIn() ? '/books' : '/login']);
  }
};