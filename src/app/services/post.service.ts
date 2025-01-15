import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Post, PostOptional } from '../interfaces/post';

type Apiresponse = { response: string, data?: Post }; // Ésta es la respuesta que recibimos de la api

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private readonly http = inject(HttpClient)
  private readonly endpoint = environment.apiendpoint
    
  constructor() { }
  
  // Pasaremos por parámetro de consulta el slug o la categoría. Si no hay parámetros, se devuelven todos los post
  getPosts({ slug, categoria }: PostOptional): Observable<Apiresponse> {
    if(slug) {
      const params = new HttpParams().set('slug', slug)
      return this.http.get<Apiresponse>(`${this.endpoint}/posts`, {params: params})
    }

    if(categoria) {
      const params = new HttpParams().set('categoria', categoria)
      return this.http.get<Apiresponse>(`${this.endpoint}/posts`, {params: params})
    }

    return this.http.get<Apiresponse>(`${this.endpoint}/posts`)
  }

  getPost (id: number) {
    return this.http.get<Apiresponse>(`${this.endpoint}/posts/${id}`)
  }

  postBook(post: PostOptional): Observable<Apiresponse> {
    return this.http.post<Apiresponse>(`${this.endpoint}/posts`, post)
  }
}
