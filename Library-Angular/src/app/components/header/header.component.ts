import { Component, output, signal, inject, OnInit, input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu'; // <-- NOVO IMPORT
import { AuthService } from '../../services/auth.service'; // <-- Ajusta o caminho se necessário
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbarModule, 
    MatIconModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatMenuModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  menuToggled = output<void>();
  themeToggled = output<boolean>();
  isDarkMode = signal(false);
  isSidebarOpen = input<boolean>(true);
  router = inject(Router);

  theme = localStorage.getItem('theme');

  // Injetar o AuthService para aceder ao utilizador e ao logout
  authService = inject(AuthService);

  ngOnInit(){
    if(this.theme === 'dark'){
      this.isDarkMode.set(true);
    }
    else{
      this.isDarkMode.set(false);
    }
  }

  onMenuClick() {
    this.menuToggled.emit(); 
  }

  toggleTheme() {
    // Inverte o valor (true -> false, false -> true)
    this.isDarkMode.update(value => !value);
    this.themeToggled.emit(this.isDarkMode());
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  onLogout() {
    this.authService.logout().subscribe();
  }
}