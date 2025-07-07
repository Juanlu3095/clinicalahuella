import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookingPartial } from '../../interfaces/book';
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

  getAllBookings (): Observable<ApiresponsePartial> {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/bookings`)
  }

  getBooking(id: string): Observable<ApiresponsePartial> {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/bookings/${id}`)
  }
  
  postBooking(book: BookingPartial): Observable<ApiresponsePartial> {
    return this.http.post<ApiresponsePartial>(`${this.endpoint}/bookings`, book, { withCredentials: true }).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  updateBooking(id: string, book: BookingPartial): Observable<ApiresponsePartial> {
    return this.http.patch<ApiresponsePartial>(`${this.endpoint}/bookings/${id}`, book, { withCredentials: true }).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  deleteBooking(id: string) {
    return this.http.delete<ApiresponsePartial>(`${this.endpoint}/bookings/${id}`, { withCredentials: true }).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  deleteBookings(ids: Array<string>) {
    const body = { // No va a modificarse el contenido una vez se pasen los parámetros, por eso const
      ids: ids
    }
    return this.http.delete<ApiresponsePartial>(`${this.endpoint}/bookings`, { body: body, withCredentials: true }).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }
}
