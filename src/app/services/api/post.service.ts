import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Post, PostOptional } from '../../interfaces/post';
import { Apiresponse } from '../../interfaces/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private readonly http = inject(HttpClient)
  private readonly endpoint = environment.apiendpoint
  private _refresh$ = new Subject<void>(); // Observable
    
  constructor() { }

  // Obtenemos el Observable
  get refresh$() {
    return this._refresh$;
  }
  
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

  postPost(post: PostOptional): Observable<Apiresponse> {
    return this.http.post<Apiresponse>(`${this.endpoint}/posts`, post).pipe(
      tap(() => {
        this.refresh$.next()
      })
    )
  }

  updatePost(id: number, post: PostOptional): Observable<Apiresponse> {
    return this.http.patch<Apiresponse>(`${this.endpoint}/posts/${id}`, post).pipe(
      tap(() => {
        this.refresh$.next()
      })
    )
  }

  deletePost(id: number): Observable<Apiresponse> {
    return this.http.delete<Apiresponse>(`${this.endpoint}/posts/${id}`).pipe(
      tap(() => {
        this.refresh$.next()
      })
    )
  }
}
