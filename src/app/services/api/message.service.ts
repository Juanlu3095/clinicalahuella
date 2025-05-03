import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message, MessagePartial } from '../../interfaces/message';
import { Apiresponse, ApiresponsePartial } from '../../interfaces/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private readonly http = inject(HttpClient)
  private readonly endpoint = environment.apiendpoint
  private _refresh$ = new Subject<void>(); // Observable

  constructor() { }

  get refresh$ () {
    return this._refresh$
  }

  getMessages(): Observable<ApiresponsePartial> {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/messages`)
  }

  getMessage(id: string): Observable<ApiresponsePartial> {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/messages/${id}`)
  }

  postMessage(message: MessagePartial): Observable<ApiresponsePartial> {
    return this.http.post<ApiresponsePartial>(`${this.endpoint}/messages`, message).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  updateMessage(id: string, messageForm: MessagePartial): Observable<ApiresponsePartial> {
    return this.http.patch<ApiresponsePartial>(`${this.endpoint}/messages/${id}`, messageForm).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  deleteMessage(id: string): Observable<ApiresponsePartial> {
    return this.http.delete<ApiresponsePartial>(`${this.endpoint}/messages/${id}`).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }
}
