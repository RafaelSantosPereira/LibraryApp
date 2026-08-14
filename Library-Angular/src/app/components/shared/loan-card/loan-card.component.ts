import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';


import { LoansService } from '../../../core/services/loans.service';
import { YesNoDialogComponent } from '../dialogs/yes-no-dialog/yes-no-dialog.component';

@Component({
  selector: 'app-loan-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule, MatButtonModule, MatTooltipModule],
  templateUrl: './loan-card.component.html',
  styleUrl: './loan-card.component.scss'
})
export class LoanCardComponent{
  

  loan = input.required<any>(); 
  isAdmin = input<boolean>(false); // Default: not an admin


  private dialog = inject(MatDialog);
  private loansService = inject(LoansService);
  private snackbar = inject(MatSnackBar);

  calculateDaysLeft(dueDate: string | null): number {
    if (!dueDate) return 0; 
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  }

  getProgressBarColor(daysLeft: number): 'primary' | 'accent' | 'warn' {
    if (daysLeft > 3) return 'primary';
    if (daysLeft > 1) return 'accent';  
    return 'warn';                      
  }

  onApprove() {
    const dialogRef = this.dialog.open(YesNoDialogComponent, {
      width: '400px',
      data: {
        title: 'Approve Loan Request',
        message: `Are you sure you want to approve the loan for "${this.loan().title}"?`,
        confirmText: 'Approve',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {

        this.loansService.approveLoan(this.loan().id).subscribe({
          next: () => {
            this.snackbar.open('Loan approved successfully!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
            
            this.loan().status = 'active';

            const newDueDate = new Date();
            newDueDate.setDate(newDueDate.getDate() + 14);
            this.loan().due_date = newDueDate.toISOString();
          },
          error: (err) => {
            this.snackbar.open(err.error?.error || 'Error approving loan.', 'Close', { duration: 4000 });
          }
        });
      }
    });

  }
  onReject() {
    const dialogRef = this.dialog.open(YesNoDialogComponent, {
      width: '400px',
      data: {
        title: 'Reject Loan Request',
        message: `Are you sure you want to reject the loan for "${this.loan().title}"?`,
        confirmText: 'Reject',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loansService.rejectLoan(this.loan().id).subscribe({
          next: () => {
            this.snackbar.open('Loan rejected successfully!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
          },
          error: (err) => {
            this.snackbar.open( 'Error rejecting loan.', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  onReturn() {
    const dialogRef = this.dialog.open(YesNoDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Book Return',
        message: `Do you want to return the book "${this.loan().title}"?`,
        confirmText: 'Yes',
        cancelText: 'No'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        
        // Send the request to the backend to return the book
        this.loansService.returnBook(this.loan().id).subscribe({
          next: () => {
            this.snackbar.open('Book returned successfully!', 'Close', { 
              duration: 3000, 
              panelClass: ['success-snackbar'] 
            });
          },
          error: (err) => {
            this.snackbar.open(err.error?.error || 'Error returning book.', 'Close', { 
              duration: 4000 
            });
          }
        });
      }
    });
  }
  
}