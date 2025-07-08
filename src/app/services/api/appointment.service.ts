import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { AppointmentPartial } from '../../interfaces/appointment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private readonly http = inject(HttpClient)
  private readonly endpoint = environment.apiendpoint
  private _refresh$ = new Subject<void>();

  constructor() { }

  get refresh$ () {
    return this._refresh$
  }

  getAllAppointments (): Observable<ApiresponsePartial> {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/appointments`, {
      params: {
        timestamp: Date.now().toString() // esto evita cache por culpa de SSR
      },
      withCredentials: true
    });
  }

  getAppointment(id: string): Observable<ApiresponsePartial> {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/appointments/${id}`, { withCredentials: true })
  }

  postAppointment(appointment: AppointmentPartial): Observable<ApiresponsePartial> {
    return this.http.post<ApiresponsePartial>(`${this.endpoint}/appointments`, appointment, { withCredentials: true }).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  updateAppointment(id: string, appointment: AppointmentPartial): Observable<ApiresponsePartial> {
    return this.http.patch<ApiresponsePartial>(`${this.endpoint}/appointments/${id}`, appointment, { withCredentials: true }).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  deleteAppointment(id: string) {
    return this.http.delete<ApiresponsePartial>(`${this.endpoint}/appointments/${id}`, { withCredentials: true }).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }
}
