import { Component, input, effect, ViewChild, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { inject } from '@angular/core';
import { Book } from '../../models/book.model';

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

  ],
  templateUrl: './books-table.component.html',
  styleUrl: './books-table.component.scss'
})
export class BooksTableComponent {
  
  private paginatorIntl = inject(MatPaginatorIntl);

  data = input<any[]>([]);
  columns = input<TableColumn[]>([]);
  totalItems = input<number>(0);

  
  //Inputs para controlar a paginação inicial
  pageSize = input<number>(10);
  pageIndex = input<number>(0); // 0-based para o MatPaginator

  // otputs para eventos
  pageChange = output<PageEvent>();
  deleteBook = output<DeleteBookEvent>()
  editBook = output<Book>();

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
}
