import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Book, BookOptional } from '../interfaces/book';

type Apiresponse = { response: string, data?: Book }; // Ésta es la respuesta que recibimos de la api

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
