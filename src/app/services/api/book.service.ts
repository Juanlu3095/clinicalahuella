import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book, BookOptional } from '../../interfaces/book';
import { Apiresponse } from '../../interfaces/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private readonly http = inject(HttpClient)
  private readonly endpoint = environment.apiendpoint
  
  constructor() { }
  
  postBook(book: BookOptional): Observable<Apiresponse> {
    return this.http.post<Apiresponse>(`${this.endpoint}/bookings`, book)
  }
}
