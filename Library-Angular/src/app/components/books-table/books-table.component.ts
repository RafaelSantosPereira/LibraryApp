import { Component, input, effect, ViewChild, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { inject } from '@angular/core';
import { Book } from '../../models/book.model';
import { AuthService } from '../../services/auth.service';
import { LoansService } from '../../services/loans.service';

export interface TableColumn {
  key: string;
  header: string;
  type: 'text' | 'status' | 'actions';
}


export interface DeleteBookEvent {
  id: number;
  title: string;
}

@Component({
  selector: 'app-books-table',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatChipsModule, 
    MatIconModule, 
    MatButtonModule, 
    MatPaginatorModule,
    MatTooltipModule
  ],
  templateUrl: './books-table.component.html',
  styleUrl: './books-table.component.scss'
})
export class BooksTableComponent {
  
  private paginatorIntl = inject(MatPaginatorIntl);
  private authService = inject(AuthService);
  loansService = inject(LoansService);

  public requestedBooksIds = this.loansService.currentBookLoans;

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  isAdmin() {
    return this.authService.isAdmin();
  }

  data = input<any[]>([]);
  columns = input<TableColumn[]>([]);
  totalItems = input<number>(0);

  currentbooksLoanded = signal<number[]>([]);

  
  //Inputs para controlar a paginação inicial
  pageSize = input<number>(10);
  pageIndex = input<number>(0); // 0-based para o MatPaginator


  // otputs para eventos
  pageChange = output<PageEvent>();
  deleteBook = output<DeleteBookEvent>()
  editBook = output<Book>();
  requestBook = output<Book>();

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    effect(() => {
      this.dataSource.data = this.data();
      this.displayedColumns = this.columns().map(col => col.key);

    });

    
    this.paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return `Page 0 of 0 (Total: ${length})`;
      }

      // Cálculo do total de páginas
      const totalPages = Math.ceil(length / pageSize);
      
      // page + 1 porque o MatPaginator começa no zero
      return `Page ${page + 1} of ${totalPages} (Total: ${length} items)`;
    };

    this.loansService.getBookLoans().subscribe();

  }


  
  onDeleteBook(bookId: number, bookTitle: string) {
    this.deleteBook.emit({ id: bookId, title: bookTitle });
  }
  
  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }

  onEditBook(book: Book){
    this.editBook.emit(book);
  }
  onRequestBook(book: Book){
    this.requestBook.emit(book);
  }
}
