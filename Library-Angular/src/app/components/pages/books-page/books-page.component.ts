import { Component, computed, inject, signal, ViewChild, ChangeDetectionStrategy, OnInit, DestroyRef } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import {PageEvent } from '@angular/material/paginator';


// Components & Services
import { BooksTableComponent } from '../../shared/books-table/books-table.component';
import { BookFormDialogComponent } from '../../dialogs/book-form-dialog/book-form-dialog.component';
import { BookDeleteFormDialogComponent } from '../../dialogs/book-delete-form-dialog/book-delete-form-dialog.component';
import { LoanActionDialogComponent } from '../../dialogs/loan-action-dialog/loan-action-dialog.component';
import { BooksService } from '../../../core/services/books.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoansService } from '../../../core/services/loans.service';
import { Book } from '../../../models/book.model';
import { TableColumn } from '../../../models/table.model'


@Component({
  selector: 'app-books-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class BooksPageComponent implements OnInit {
  
  private booksService = inject(BooksService);
  private loansService = inject(LoansService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  @ViewChild(BooksTableComponent) booksTable!: BooksTableComponent;

  // Data signals
  booksData = this.booksService.displayedBooks;
  totalBooks = this.booksService.totalBooks;
  
  // State variables
  searchQuery = signal('');
  currentPageIndex = 1;
  currentPageSize = 10;

  // Auth and Loans state
  isAdmin = computed(() => this.authService.isAdmin());
  isLoggedIn = computed(() => this.authService.isLoggedIn());
  requestedBookIds = this.loansService.currentUserBookLoans;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    // Subscribe to URL changes
    const queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const SearchQuery = params['query'] || '';
      const page = params['page'] ? Number(params['page']) : 1;
      const limit = params['limit'] ? Number(params['limit']) : 10;
      
      this.currentPageIndex = page;
      this.currentPageSize = limit;
      this.searchQuery.set(SearchQuery); // Update signal
      
      if (SearchQuery) {
        this.booksService.searchBooks(SearchQuery, page, limit).subscribe();
      } else {
        this.loadBooks(page, limit);
      }
    });

    this.destroyRef.onDestroy(() => {
      queryParamsSubscription.unsubscribe();
    });
  }

  loadBooks(page: number, limit: number) {
    this.booksService.getBooks(page, limit).subscribe();
  }

  // Use computed() so the actions dynamically update when the state changes 
  // (e.g., when the user requests a book or logs in)
  tableConfig = computed<TableColumn[]>(() => [
    { key: 'title', header: 'Title', type: 'text' },
    { key: 'author', header: 'Author', type: 'text' },
    { key: 'category', header: 'Category', type: 'text' },
    { key: 'total_copies', header: 'Total Copies', type: 'text' },
    { key: 'available_copies', header: 'Available Copies', type: 'text' },
    { 
      key: 'status', 
      header: 'Status', 
      type: 'status',
      // Dynamic status configuration for Books
      formatStatus: (row: any) => ({
        text: row.available_copies > 0 ? 'available' : 'unavailable',
        colorClass: row.available_copies > 0 ? 'available' : 'unavailable'
      })
    }, 
    { 
      key: 'actions', 
      header: 'Actions', 
      type: 'actions',
      actions: [
        {
          actionKey: 'edit',
          icon: 'edit',
          color: 'primary',
          tooltip: 'Edit Book',
          show: (row) => this.isAdmin()
        },
        {
          actionKey: 'delete',
          icon: 'delete',
          color: 'warn',
          tooltip: 'Delete Book',
          show: (row) => this.isAdmin()
        },
        {
          actionKey: 'request',
          icon: 'library_add',
          color: 'warn',
          tooltip: 'Request Book',
          // Show only if logged in, has copies, and hasn't been requested yet
          show: (row) => this.isLoggedIn() && row.available_copies > 0 && !this.requestedBookIds().includes(row.id)
        },
        {
          actionKey: 'login_required',
          icon: 'lock_outline',
          color: 'primary', // Using standard color, can be styled with CSS if needed
          tooltip: 'Log in for available actions',
          // Show only if NOT logged in
          show: (row) => !this.isLoggedIn()
        }
      ]
    }
  ]);

  // Centralized action handler
  handleTableAction(event: { actionKey: string; row: Book }) {
    const { actionKey, row } = event;

    switch (actionKey) {
      case 'edit':
        this.onEditBook(row);
        break;
      case 'delete':
        this.onDeleteBook(row);
        break;
      case 'request':
        this.onRequestBook(row);
        break;
      case 'login_required':
        // Do nothing, or open a login dialog/snackbar if you want!
        console.log('User must log in');
        break;
    }
  }

  addBook() {
    this.dialog.open(BookFormDialogComponent, {
      width: '600px'
    });
  }

  onPageChange(event: PageEvent) {
    const pageIndex = event.pageIndex + 1; 
    const pageSize = event.pageSize;
    
    this.currentPageIndex = pageIndex;
    this.currentPageSize = pageSize;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        query: this.searchQuery() || undefined, 
        page: pageIndex, 
        limit: pageSize 
      },
      queryParamsHandling: 'merge',
    });
  }

  onSearchChange(query: string) {
    const pageSize = this.booksTable?.paginator?.pageSize || this.currentPageSize;
    const pageIndex = 1;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        query: query || undefined, 
        page: pageIndex, 
        limit: pageSize 
      },
      queryParamsHandling: 'merge',
    });
  }

  onDeleteBook(book: Book) {
    const dialogRef = this.dialog.open(BookDeleteFormDialogComponent, {
      data: { bookTitle: book.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.booksService.deleteBook(book.id).subscribe();
      }
    });
  }

  onEditBook(book: Book) {
    this.dialog.open(BookFormDialogComponent, {
      data: { book },
      width: '600px'
    });
  }

  onRequestBook(book: Book) {
    const dialogRef = this.dialog.open(LoanActionDialogComponent, {
      width: '400px', 
      data: { book: book } 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // If confirmed, trigger a quick refresh to update "Available Copies" immediately
        this.loadBooks(this.currentPageIndex, this.currentPageSize);
      }
    });
  }
}