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
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/messages`, { withCredentials: true })
  }

  getMessage(id: string): Observable<ApiresponsePartial> {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/messages/${id}`, { withCredentials: true })
  }

  postMessage(message: MessagePartial): Observable<ApiresponsePartial> {
    const {nombre, apellidos, email, telefono, asunto, mensaje} = message
    return this.http.post<ApiresponsePartial>(`${this.endpoint}/messages`, {
      nombre, apellidos, email, telefono, asunto, mensaje
    }, { withCredentials: true }).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  updateMessage(id: string, messageForm: MessagePartial): Observable<ApiresponsePartial> {
    const {nombre, apellidos, email, telefono, asunto, mensaje} = messageForm
    return this.http.patch<ApiresponsePartial>(`${this.endpoint}/messages/${id}`, {
      nombre, apellidos, email, telefono, asunto, mensaje
    }, { withCredentials: true }).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  deleteMessage(id: string): Observable<ApiresponsePartial> {
    return this.http.delete<ApiresponsePartial>(`${this.endpoint}/messages/${id}`, { withCredentials: true }).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  deleteMessages(ids: Array<string>): Observable<ApiresponsePartial> {
    let body = {
      ids: ids
    }
    return this.http.delete<ApiresponsePartial>(`${this.endpoint}/messages`, { body: body, withCredentials: true }).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }
}
