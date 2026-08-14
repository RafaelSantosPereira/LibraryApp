import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface YesNoDialogData {
  title: string;
  message: string;
  confirmText?: string; // Optional (e.g. "Yes", "Delete")
  cancelText?: string;  // Optional (e.g. "No", "Cancel")
}

@Component({
  selector: 'app-yes-no-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './yes-no-dialog.component.html',
  styleUrl: './yes-no-dialog.component.scss'
})
export class YesNoDialogComponent {
  private dialogRef = inject(MatDialogRef<YesNoDialogComponent>);
  public data = inject<YesNoDialogData>(MAT_DIALOG_DATA);

  onConfirm() {
    this.dialogRef.close(true);  // Return true when closed
  }

  onCancel() {
    this.dialogRef.close(false); // Return false when closed
  }
}