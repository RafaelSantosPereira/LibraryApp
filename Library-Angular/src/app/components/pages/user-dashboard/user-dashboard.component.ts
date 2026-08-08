import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../../services/auth.service';
import { LoansService } from '../../../services/loans.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule, MatListModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit {
  authService = inject(AuthService);
  loansService = inject(LoansService);
  
  username = computed(() => this.authService.currentUser()?.username || 'Leitor');

  wishlist = [
    { title: 'Dune', author: 'Frank Herbert' },
    { title: 'Steve Jobs', author: 'Walter Isaacson' }
  ];

  ngOnInit() {

    this.loansService.getUserLoans().subscribe();
  }

  activeLoans = computed(() => 
    this.loansService.userLoans().filter(loan => loan.status === 'active' || loan.status === 'pending')
  );

  // Calcula estatísticas a partir do signal
  stats = computed(() => {
    const allLoans = this.loansService.userLoans();
    return {
      activeCount: allLoans.filter(l => l.status === 'active').length,
      pendingCount: allLoans.filter(l => l.status === 'pending').length,
      returnedCount: allLoans.filter(l => l.status === 'returned').length,
    };
  });

  // Função auxiliar para calcular os dias no HTML
  calculateDaysLeft(dueDate: string | null): number {
    if (!dueDate) return 0; // Ex: Se estiver pending, ainda não tem due_date
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    return diffDays;
  }

  getProgressBarColor(daysLeft: number): 'primary' | 'accent' | 'warn' {
    if (daysLeft > 3) return 'primary';
    if (daysLeft > 1) return 'accent';  
    return 'warn';                      
  }
}