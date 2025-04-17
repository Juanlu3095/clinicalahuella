import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message, MessageOptional } from '../../interfaces/message';
import { Apiresponse } from '../../interfaces/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private readonly http = inject(HttpClient)
  private readonly endpoint = environment.apiendpoint

  constructor() { }

  postMessage(message: MessageOptional): Observable<Apiresponse> {
    return this.http.post<Apiresponse>(`${this.endpoint}/messages`, message)
  }
}
