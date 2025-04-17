import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Newsletter } from '../../interfaces/newsletter';
import { environment } from '../../../environments/environment';
import { Apiresponse } from '../../interfaces/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {

  private readonly http = inject(HttpClient)
  private readonly endpoint = environment.apiendpoint

  constructor() { }

  postNewsletter(newsletter: Partial<Newsletter>): Observable<Apiresponse> {
    return this.http.post<Apiresponse>(`${this.endpoint}/newsletters`, newsletter)
  }
}
