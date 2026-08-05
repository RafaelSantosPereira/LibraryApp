import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule, MatListModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent {
  authService = inject(AuthService);
  
  // Lemos o nome do utilizador do signal do AuthService
  username = computed(() => this.authService.currentUser()?.username || 'Leitor');

  // DADOS FALSOS (MOCK) para veres o design enquanto não fazes o Backend
  stats = {
    activeLoans: 2,
    booksRead: 14,
    wishlistCount: 5
  };

  activeLoans = [
    { title: '1984', author: 'George Orwell', dueDate: new Date('2026-08-10'), daysLeft: 5, progress: 70 },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', dueDate: new Date('2026-08-06'), daysLeft: 1, progress: 95 }
  ];

  wishlist = [
    { title: 'Dune', author: 'Frank Herbert' },
    { title: 'Steve Jobs', author: 'Walter Isaacson' }
  ];

  // Função para mudar a cor da barra de progresso consoante a urgência
  getProgressBarColor(daysLeft: number): 'primary' | 'accent' | 'warn' {
    if (daysLeft > 3) return 'primary'; // Verde/Azul (Tranquilo)
    if (daysLeft > 1) return 'accent';  // Amarelo/Laranja (Atenção)
    return 'warn';                      // Vermelho (Atrasado ou Quase)
  }
}