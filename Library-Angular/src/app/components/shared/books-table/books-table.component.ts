import { Component, computed, input, effect, ViewChild, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { inject } from '@angular/core';
import { Book } from '../../../models/book.model';
import { AuthService } from '../../../core/services/auth.service';
import { LoansService } from '../../../core/services/loans.service';
import { Loan } from '../../../models/loan.model';
import { TableColumn } from '../../../models/table.model'




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

  public requestedBooksIds = this.loansService.currentUserBookLoans;

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  isAdmin = computed(() => this.authService.isAdmin());

  data = input<any[]>([]);
  columns = input<TableColumn[]>([]);
  totalItems = input<number>(0);

  currentbooksLoanded = signal<number[]>([]);

  
  // Inputs to control the initial pagination
  pageSize = input<number>(10);
  pageIndex = input<number>(0); // 0-based for MatPaginator


  // Outputs for events
  pageChange = output<PageEvent>();
  actionClicked = output<{ actionKey: string; row: any}>();

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

      // Calculate the total number of pages
      const totalPages = Math.ceil(length / pageSize);
      
      // page + 1 because MatPaginator starts at zero
      return `Page ${page + 1} of ${totalPages} (Total: ${length} items)`;
    };

    this.loansService.getUserBookIdLoans().subscribe();

  }

  onActionClick(actionKey: string, row: any) {
    this.actionClicked.emit({ actionKey, row });
  }
  
  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }

}
