import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { LoginPageComponent } from './components/pages/login-page/login-page.component';
import { SignupPageComponent } from './components/pages/signup-page/signup-page.component';
import { adminGuard } from './core/guards/admin.guard';



export const routes: Routes = [
  // 1. Routes without Sidebar/Header
  { path: 'login', component: LoginPageComponent },
  { path: 'signup', component: SignupPageComponent },

  // 2. Routes with Sidebar/Header
  {
    path: '',
    component: MainLayoutComponent, // This component contains the sidebar
    children: [
      {
        path: '',
        loadComponent: () => import('./components/pages/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent),
      },
      { path: 'books', 
        loadComponent: () => import('./components/pages/books-page/books-page.component').then(m => m.BooksPageComponent) 
      },
      { path: 'manage-loans', 
        canActivate: [adminGuard],
        loadComponent: () => import('./components/pages/loans-page/loans-page.component').then(m => m.LoansPageComponent)
      },
      { path: 'readers', 
        loadComponent: () => import('./components/pages/readers-page/readers-page.component').then(m => m.ReadersPageComponent) ,
        
      },
    ]
  },

  // Fallback route
  { path: '**', redirectTo: 'login' }
];
