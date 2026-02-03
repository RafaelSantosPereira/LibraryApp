import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BooksService } from '../../services/books.service';
import { CreateBookDto, UpdateBookDto } from '../../models/book.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-book-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './book-form-dialog.component.html',
  styleUrl: './book-form-dialog.component.scss'
})
export class BookFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<BookFormDialogComponent>);
  private booksService = inject(BooksService);



  data = inject(MAT_DIALOG_DATA, { optional: true });

  bookForm!: FormGroup;
  isEditMode = false;

  ngOnInit() {
    // Verifica se está em modo edição
    this.isEditMode = !!(this.data?.book);
    
    const book = this.data?.book;
    
    this.bookForm = this.fb.group({
      title: [book?.title || '', [Validators.required, Validators.minLength(2)]],
      author: [book?.author || '', [Validators.required, Validators.minLength(2)]],
      category: [book?.category || '', Validators.required],
      year: [book?.year || new Date().getFullYear(), [Validators.required, Validators.min(1000), Validators.max(9999)]],
      total_copies: [book?.total_copies || 1, [Validators.required, Validators.min(1)]],
      available_copies: [book?.available_copies || 1, [Validators.required, Validators.min(0)]]
    });

    console.log('Modo edição:', this.isEditMode);
    console.log('Dados recebidos:', this.data);
    console.log('Valores do form:', this.bookForm.value);



  }

  onSave() {
    if (this.bookForm.valid) {
      const formValue = this.bookForm.value;
      
      if (this.isEditMode) {
        
        const bookId = this.data.book.id;
        const updateData: UpdateBookDto = {
          id: bookId,
          title: formValue.title,
          author: formValue.author,
          category: formValue.category,
          year: formValue.year,
          total_copies: formValue.total_copies,
          available_copies: formValue.available_copies
        };
        
        this.booksService.updateBook(updateData).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Erro ao atualizar livro:', err);
          }
        });
              
      } else {

        const bookData: CreateBookDto = {
          title: formValue.title,
          author: formValue.author,
          category: formValue.category,
          year: formValue.year,
          total_copies: formValue.total_copies
        };
        
        this.booksService.addBook(bookData).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (err) => {
            console.error('Erro ao adicionar livro:', err);
          }
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}