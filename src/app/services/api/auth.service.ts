import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiresponsePartial } from '../../interfaces/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient)
  private readonly endpoint = environment.apiendpoint

  constructor() { }

  login(authForm: any) {
    const { email, password } = authForm
    return this.http.post<ApiresponsePartial>(`${this.endpoint}/auth/login`, {email, password}, {withCredentials: true})
  }
  
  comprobarLogin() {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/auth/login`, { withCredentials: true })
  }

  logout() {
    return this.http.post<ApiresponsePartial>(`${this.endpoint}/auth/logout`, null, { withCredentials: true })
  }

}
