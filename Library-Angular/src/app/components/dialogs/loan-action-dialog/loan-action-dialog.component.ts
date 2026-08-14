import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoansService } from '../../../core/services/loans.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-loan-action-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './loan-action-dialog.component.html',
  styleUrl: './loan-action-dialog.component.scss'
})
export class LoanActionDialogComponent {
  private dialogRef = inject(MatDialogRef<LoanActionDialogComponent>);
  public data = inject(MAT_DIALOG_DATA);
  private loansService = inject(LoansService);
  private snackbar = inject(MatSnackBar);

  isSubmitting = false;
  errorMessage = '';

  onConfirm() {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.loansService.requestBook(this.data.book.id).subscribe({
      next: (response) => {
        this.dialogRef.close(true);
        this.snackbar.open('Book request submitted successfully!','Close', 
          {
            duration: 4000, // 4 seconds
            panelClass: ['success-snackbar'],

          }
        );
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'An error occurred while requesting the book.';
        this.isSubmitting = false;
      }
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}