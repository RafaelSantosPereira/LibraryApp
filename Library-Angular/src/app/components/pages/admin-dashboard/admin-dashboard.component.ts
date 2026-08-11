import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../../services/auth.service';
import { LoansService } from '../../../services/loans.service';
import { LoanCardComponent } from '../../loan-card/loan-card.component';
import { YesNoDialogComponent } from '../../dialogs/yes-no-dialog/yes-no-dialog.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatListModule,
    LoanCardComponent,
    YesNoDialogComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
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

  // Ccalculates statistics from the signal
  stats = computed(() => {
    const allLoans = this.loansService.userLoans();
    return {
      activeCount: allLoans.filter(l => l.status === 'active').length,
      pendingCount: allLoans.filter(l => l.status === 'pending').length,
      returnedCount: allLoans.filter(l => l.status === 'returned').length,
    };
  });

  // Helper function to calculate days left for the HTML
  calculateDaysLeft(dueDate: string | null): number {
    if (!dueDate) return 0; 
    
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
