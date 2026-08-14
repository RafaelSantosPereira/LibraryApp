import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-book-delete-form-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './book-delete-form-dialog.component.html',
  styleUrl: './book-delete-form-dialog.component.scss'
})
export class BookDeleteFormDialogComponent {
  private dialogRef = inject(MatDialogRef<BookDeleteFormDialogComponent>);
  data = inject(MAT_DIALOG_DATA);

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}