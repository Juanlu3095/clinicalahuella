import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewsletterOptional } from '../../interfaces/newsletter';
import { environment } from '../../../environments/environment';
import { Apiresponse, ApiresponsePartial } from '../../interfaces/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {

  private readonly http = inject(HttpClient)
  private readonly endpoint = environment.apiendpoint

  constructor() { }

  getNewsletters(): Observable<ApiresponsePartial> {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/newsletters`)
  }

  getNewsletter(id: string): Observable<ApiresponsePartial> {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/newsletters/${id}`)
  }

  postNewsletter(newsletter: NewsletterOptional): Observable<ApiresponsePartial> {
    const { email } = newsletter
    return this.http.post<ApiresponsePartial>(`${this.endpoint}/newsletters`, { email })
  }

  updateNewsletter(id: string, newsletter: NewsletterOptional): Observable<ApiresponsePartial> {
    const { email } = newsletter
    return this.http.patch<ApiresponsePartial>(`${this.endpoint}/newsletters/${id}`, { email })
  }

  deleteNewsletter(id: string): Observable<ApiresponsePartial> {
    return this.http.delete<ApiresponsePartial>(`${this.endpoint}/newsletters/${id}`)
  }

  deleteSelectedNewsletter(ids: Array<string>) {
    const body = { // No va a modificarse el contenido una vez se pasen los parámetros, por eso const
      ids: ids
    }
    return this.http.delete<ApiresponsePartial>(`${this.endpoint}/newsletters`, { body: body })
  }
}
