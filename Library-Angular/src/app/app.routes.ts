import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { SignupPageComponent } from './components/pages/signup-page/signup-page.component';
import { adminGuard } from './admin.guard';



export const routes: Routes = [
  // 1. Rotas Sem Sidebar/Header (Públicas)
  { path: 'login', component: LoginPageComponent },
  { path: 'signup', component: SignupPageComponent },

  // 2. Rotas Com Sidebar/Header (Privadas)
  {
    path: '',
    component: MainLayoutComponent, // Este componente tem a sidebar
    children: [
      { path: 'books', 
        loadComponent: () => import('./components/pages/books-page/books-page.component').then(m => m.BooksPageComponent) 
      },
      { path: 'readers', 
        loadComponent: () => import('./components/pages/readers-page/readers-page.component').then(m => m.ReadersPageComponent) ,
        
        canActivate: [adminGuard]
      },
    ]
  },

  // Rota de fallback
  { path: '**', redirectTo: 'login' }
];
