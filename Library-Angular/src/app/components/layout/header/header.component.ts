import { Component, output, signal, inject, OnInit, input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu'; // <-- NEW IMPORT
import { AuthService } from '../../../core/services/auth.service'; // Adjust the path if needed
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
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

  // Inject the AuthService to access the user and handle logout
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
    // Toggle the value (true -> false, false -> true)
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