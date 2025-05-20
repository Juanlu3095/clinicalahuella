import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PostPartial } from '../../interfaces/post';
import { ApiresponsePartial } from '../../interfaces/apiresponse';

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
  getPosts({ categoria, limit }: {categoria?: string, limit?: number}): Observable<ApiresponsePartial> {
    if(categoria) {
      const params = new HttpParams().set('categoria', categoria)
      return this.http.get<ApiresponsePartial>(`${this.endpoint}/posts`, {params: params})
    }

    if(limit) {
      const params = new HttpParams().set('limit', limit)
      return this.http.get<ApiresponsePartial>(`${this.endpoint}/posts`, {params: params})
    }

    return this.http.get<ApiresponsePartial>(`${this.endpoint}/posts`)
  }

  getPostById (id: number) {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/posts/${id}`)
  }

  getPostBySlug(slug: string) {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/posts/slug/${slug}`)
  }

  postPost(post: PostPartial): Observable<ApiresponsePartial> {
    return this.http.post<ApiresponsePartial>(`${this.endpoint}/posts`, post).pipe(
      tap(() => {
        this.refresh$.next()
      })
    )
  }

  updatePost(id: number, post: PostPartial): Observable<ApiresponsePartial> {
    return this.http.patch<ApiresponsePartial>(`${this.endpoint}/posts/${id}`, post).pipe(
      tap(() => {
        this.refresh$.next()
      })
    )
  }

  deletePost(id: number): Observable<ApiresponsePartial> {
    return this.http.delete<ApiresponsePartial>(`${this.endpoint}/posts/${id}`).pipe(
      tap(() => {
        this.refresh$.next()
      })
    )
  }
}
