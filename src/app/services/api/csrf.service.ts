import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiresponsePartial } from '../../interfaces/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {

  private readonly http = inject(HttpClient)
  private readonly endpoint = environment.apiendpoint

  constructor() {}

  getCsrf (): Observable<ApiresponsePartial> {
    return this.http.get(`${this.endpoint}/csrf`, {withCredentials: true})
  }
}
