import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookPartial } from '../../interfaces/book';
import { ApiresponsePartial } from '../../interfaces/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private readonly http = inject(HttpClient)
  private readonly endpoint = environment.apiendpoint
  private _refresh$ = new Subject<void>();
  
  constructor() { }

  get refresh$ () {
    return this._refresh$
  }

  getAllBooks (): Observable<ApiresponsePartial> {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/bookings`)
  }

  getBook(id: string): Observable<ApiresponsePartial> {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/bookings/${id}`)
  }
  
  postBook(book: BookPartial): Observable<ApiresponsePartial> {
    return this.http.post<ApiresponsePartial>(`${this.endpoint}/bookings`, book).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  updateBook(id: string, book: BookPartial): Observable<ApiresponsePartial> {
    return this.http.patch<ApiresponsePartial>(`${this.endpoint}/bookings/${id}`, book).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  deleteBook(id: string) {
    return this.http.delete<ApiresponsePartial>(`${this.endpoint}/bookings/${id}`).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  deleteBooks(ids: Array<string>) {
    const body = { // No va a modificarse el contenido una vez se pasen los parámetros, por eso const
      ids: ids
    }
    return this.http.delete<ApiresponsePartial>(`${this.endpoint}/bookings/`, { body: body }).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }
}
