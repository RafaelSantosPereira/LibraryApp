import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Book, CreateBookDto, UpdateBookDto } from '../models/book.model'; 
import { tap } from 'rxjs';

interface PaginatedResponse {
  data: Book[];
  meta: { total: number, page: number, last_page: number };
}

@Injectable({
  providedIn: 'root'
})
export class BooksService {

  private httpClient = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';
  
  currentBooks = signal<Book[]>([]);
  totalBooks = signal<number>(0);
  displayedBooks = this.currentBooks.asReadonly();

  getBooks(page: number = 1, limit: number = 10) {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.httpClient.get<PaginatedResponse>(`${this.apiUrl}/books`, { params }).pipe(
      tap({
        next: (response) => {
          this.currentBooks.set(response.data);
          this.totalBooks.set(response.meta.total);
        },
        error: (err) => console.error('Erro:', err)
      })
    );
  }

  addBook(book: CreateBookDto) {
    return this.httpClient.post<Book>(`${this.apiUrl}/books`, book).pipe( 
      tap({
        next: (newBook) => {
          this.currentBooks.update(books => [...books, newBook]);
        },
        error: (err) => {
          console.error('Error adding book:', err);
        }
      })
    );
  }

  
  updateBook(bookData: UpdateBookDto) {
    return this.httpClient.put<Book>(`${this.apiUrl}/book/${bookData.id}`, bookData).pipe(
      tap({
        next: (updatedBook) => {
          this.currentBooks.update(books => 
            books.map(book => book.id === updatedBook.id ? updatedBook : book)
          );
        },
        error: (err) => {
          console.error('Error updating book:', err);
        }
      })
    );
  }

  deleteBook(bookId: number) {
    return this.httpClient.delete(`${this.apiUrl}/book/${bookId}`).pipe(
      tap({
        next: () => {
          this.currentBooks.update(books => books.filter(book => book.id !== bookId));
        },
        error: (err) => {
          console.error('Error deleting book:', err);
        }
      })
    );
  }

  searchBooks(query: string, page: number = 1, limit: number = 10) {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.httpClient.get<PaginatedResponse>(`${this.apiUrl}/books/search`, { params }).pipe(
      tap({
        next: (response) => {
          this.currentBooks.set(response.data);
          this.totalBooks.set(response.meta.total);
        },
        error: (err) => console.error('Erro:', err)
      })
    );
  }
}