import { Component, input, signal, ViewChild } from '@angular/core';
import { BooksTableComponent } from '../../books-table/books-table.component';
import { Book } from '../../../models/book.model';
import { TableColumn } from '../../books-table/books-table.component';
import { BookFormDialogComponent } from '../../book-form-dialog/book-form-dialog.component';
import { BooksService } from '../../../services/books.service';
import { inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookDeleteFormDialogComponent } from '../../book-delete-form-dialog/book-delete-form-dialog.component';
import { DeleteBookEvent } from '../../books-table/books-table.component';

// Imports do Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router'; 


@Component({
  selector: 'app-books-page',
  standalone: true,
  imports: [
    BooksTableComponent,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './books-page.component.html',
  styleUrl: './books-page.component.scss'
})


export class BooksPageComponent {
  
  private booksService = inject(BooksService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @ViewChild(BooksTableComponent) booksTable!: BooksTableComponent;

  booksData = this.booksService.displayedBooks;
  totalBooks = this.booksService.totalBooks;
  searchQuery = signal('');

  currentPageIndex = 1;
  currentPageSize = 10;

  constructor(private dialog: MatDialog) {}

  

  ngOnInit() {
    // Subscreve às mudanças na URL
    this.route.queryParams.subscribe(params => {
      const SearchQuery = params['query'] || '';
      const page = params['page'] ? Number(params['page']) : 1;
      const limit = params['limit'] ? Number(params['limit']) : 10;
      
      this.currentPageIndex = page;
      this.currentPageSize = limit;
      this.searchQuery = SearchQuery;
      
      if (SearchQuery) {
        this.booksService.searchBooks(SearchQuery, page, limit).subscribe();
      } else {
        this.loadBooks(page, limit);
      }
    });
  }

  loadBooks(page: number, limit: number) {
    this.booksService.getBooks(page, limit).subscribe();
  }

  tableConfig = signal<TableColumn[]>([
    { key: 'title', header: 'Title', type: 'text' },
    { key: 'author', header: 'Author', type: 'text' },
    { key: 'category', header: 'Category', type: 'text' },
    { key: 'total_copies', header: 'Total Copies', type: 'text' },
    { key: 'available_copies', header: 'Available Copies', type: 'text' },
    { key: 'status', header: 'Status', type: 'status' }, 
    { key: 'actions', header: 'Actions', type: 'actions' }
  ]);

  addBook() {
    const dialogRef = this.dialog.open(BookFormDialogComponent, {
      width: '600px'
    });
  }

  // Esta função corre quando a Tabela emite o evento "pageChange"
  onPageChange(event: any) {
    // O MatPaginator usa índice 0 (página 0, 1, 2), mas o backend espera (1, 2, 3)
    const pageIndex = event.pageIndex + 1; 
    const pageSize = event.pageSize;
    
    this.currentPageIndex = pageIndex;
    this.currentPageSize = pageSize;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        query: this.searchQuery || undefined, // Se query vazia, remove o parâmetro
        page: pageIndex, 
        limit: pageSize 
      },
      queryParamsHandling: 'merge',
    });
  }

  onSearchChange(query: string) {
    // Usa os valores atuais da tabela, ou valores padrão se a tabela ainda não existir
    const pageSize = this.booksTable?.paginator?.pageSize || this.currentPageSize;
    
    // Quando pesquisa, volta sempre para a página 1
    const pageIndex = 1;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        query: query || undefined, // Se query vazia, remove o parâmetro
        page: pageIndex, 
        limit: pageSize 
      },
      queryParamsHandling: 'merge',
    });
  }
  onDeleteBook(event: DeleteBookEvent) {
    const dialogRef = this.dialog.open(BookDeleteFormDialogComponent, {
      data: { bookTitle: event.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.booksService.deleteBook(event.id).subscribe();
      }
    });
  }
  onEditBook(book: Book) {
    const dialogRef = this.dialog.open(BookFormDialogComponent, {
      data: { book },
      width: '600px'
    });

    }

}