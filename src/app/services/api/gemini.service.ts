import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly http = inject(HttpClient)
  private readonly endpoint = environment.apiendpoint

  constructor() { }

  enviarPromptAI (chatMessages: any[]) {
    const body = {
      messages: chatMessages
    }
    return this.http.post<any>(`${this.endpoint}/ai`, body)
  }
}
