import { Component, computed, inject, signal, ViewChild, OnInit, DestroyRef } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {PageEvent } from '@angular/material/paginator';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog'; // IMPORT MatDialog HERE
import { YesNoDialogComponent } from '../../shared/dialogs/yes-no-dialog/yes-no-dialog.component';

// Components & Services
import { BooksTableComponent } from '../../shared/books-table/books-table.component';
import { TableColumn } from '../../../models/table.model'
import { AuthService } from '../../../core/services/auth.service';
import { LoansService } from '../../../core/services/loans.service';
import { Loan } from '../../../models/loan.model';

@Component({
  selector: 'app-loans-page',
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
  templateUrl: './loans-page.component.html',
  styleUrl: './loans-page.component.scss'
})
export class LoansPageComponent implements OnInit {
  private loansService = inject(LoansService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  
  private dialog = inject(MatDialog); 

  @ViewChild(BooksTableComponent) table!: BooksTableComponent;

  // Read Signals directly from the service
  loansData = this.loansService.allLoans;
  totalLoans = this.loansService.totalLoans; 
  
  searchQuery = '';
  currentPageIndex = 1;
  currentPageSize = 10;
  isAdmin = computed(() => this.authService.isAdmin());

  tableConfig = signal<TableColumn[]>([
    { key: 'user_name', header: 'User', type: 'text' },
    { key: 'user_email', header: 'Email', type: 'text' },
    { key: 'title', header: 'Book Title', type: 'text' },
    { 
      key: 'request_date', 
      header: 'Requested', 
      type: 'date',
      dateFormat: 'dd/MM/yyyy HH:mm' // With time (Admin needs to know when it was asked)
    },
    { 
      key: 'loan_date', 
      header: 'Approved', 
      type: 'date',
      dateFormat: 'dd/MM/yyyy HH:mm' // With time (Admin needs to know exact approval moment)
    },
    { 
      key: 'due_date', 
      header: 'Due Date', 
      type: 'date',
      dateFormat: 'dd/MM/yyyy' // Without time (User just needs the day)
    },
    { 
      key: 'status', 
      header: 'Status', 
      type: 'status',
      formatStatus: (row: any) => ({
        text: row.status, 
        colorClass: row.status 
      })
    },
    { 
      key: 'actions', 
      header: 'Actions', 
      type: 'actions',
      actions: [
        {
          actionKey: 'approve',
          icon: 'check_circle',
          color: 'primary',
          tooltip: 'Approve Loan',
          show: (row) => row.status === 'pending'
        },
        {
          actionKey: 'reject',
          icon: 'cancel',
          color: 'warn',
          tooltip: 'Reject Loan',
          show: (row) => row.status === 'pending'
        },
        {
          actionKey: 'return',
          icon: 'keyboard_return',
          color: 'accent',
          tooltip: 'Register Return',
          show: (row) => row.status === 'active'
        }
      ]
    }
  ]);

  ngOnInit() {
    const queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const query = params['query'] || '';
      const page = params['page'] ? Number(params['page']) : 1;
      const limit = params['limit'] ? Number(params['limit']) : 10;
      
      this.currentPageIndex = page;
      this.currentPageSize = limit;
      this.searchQuery = query;
      
      if (query) {
        this.loansService.searchLoans(query, page, limit).subscribe();
      } else {
        this.loansService.getAllLoans(page, limit).subscribe();
      }
    });

    this.destroyRef.onDestroy(() => {
      queryParamsSubscription.unsubscribe();
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
        query: this.searchQuery || undefined,
        page: pageIndex, 
        limit: pageSize 
      },
      queryParamsHandling: 'merge',
    });
  }

  onSearchChange(query: string) {
    const pageSize = this.table?.paginator?.pageSize || this.currentPageSize;
    const pageIndex = 1; // Always reset to page 1 when searching
    
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

  handleTableAction(event: { actionKey: string; row: Loan }) {
    const { actionKey, row } = event;

    switch (actionKey) {
      case 'approve':
        this.approveLoan(row);
        break;
      case 'reject':
        this.rejectLoan(row);
        break;
      case 'return':
        this.returnLoan(row);
        break;
    }
  }

  approveLoan(row: Loan) {
    const dialogRef = this.dialog.open(YesNoDialogComponent, {
      width: '400px',
      data: {
        title: 'Approve Loan Request',
        message: `Are you sure you want to approve the request for "${row.title}" by ${row.user_name}?`,
        confirmText: 'Approve',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.loansService.approveLoan(row.id).subscribe({
          next: () => {
            // Refresh the table to reflect the new status
            this.loansService.getAllLoans(this.currentPageIndex, this.currentPageSize).subscribe();
          },
          error: (err) => console.error('Error approving loan:', err)
        });
      }
    });
  }

  rejectLoan(row: Loan) {
    const dialogRef = this.dialog.open(YesNoDialogComponent, {
      width: '400px',
      data: {
        title: 'Reject Loan Request',
        message: `Are you sure you want to reject the request for "${row.title}" by ${row.user_name}? The book will be returned to the available stock.`,
        confirmText: 'Reject',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.loansService.rejectLoan(row.id).subscribe({
          next: () => {
            // Refresh the table to reflect the new status
            this.loansService.getAllLoans(this.currentPageIndex, this.currentPageSize).subscribe();
          },
          error: (err) => console.error('Error rejecting loan:', err)
        });
      }
    });
  }

  returnLoan(row: Loan) {
    const dialogRef = this.dialog.open(YesNoDialogComponent, {
      width: '400px',
      data: {
        title: 'Register Book Return',
        message: `Has the user ${row.user_name} successfully returned "${row.title}"?`,
        confirmText: 'Yes, Returned',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.loansService.returnBook(row.id).subscribe({
          next: () => {
            // Refresh the table to reflect the new status
            this.loansService.getAllLoans(this.currentPageIndex, this.currentPageSize).subscribe();
          },
          error: (err) => console.error('Error returning book:', err)
        });
      }
    });
  }
}