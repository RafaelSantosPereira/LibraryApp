import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'books',
        loadComponent: () => import('./components/pages/books-page/books-page.component').then(m => m.BooksPageComponent)
        
    },
    {
        path: 'login',
        loadComponent: () => import('./components/pages/login-page/login-page.component').then(m => m.LoginPageComponent)
    }
];
