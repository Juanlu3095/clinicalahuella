import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, Subject, tap } from 'rxjs';
import { Apiresponse } from '../../interfaces/apiresponse';
import { Category, CategoryPartial } from '../../interfaces/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private readonly http = inject(HttpClient)
  private readonly endpoint = environment.apiendpoint
  private _refresh$ = new Subject<void>(); // Observable
      
  constructor() { }
  
  // Obtenemos el Observable
  get refresh$() {
    return this._refresh$;
  }

  getCategories(): Observable<Apiresponse> {
    return this.http.get<Apiresponse>(`${this.endpoint}/categories`)
  }

  getCategory(id: number): Observable<Apiresponse> {
    return this.http.get<Apiresponse>(`${this.endpoint}/categories/${id}`)
  }

  postCategory(categoryForm: CategoryPartial): Observable<Apiresponse> {
    return this.http.post<Apiresponse>(`${this.endpoint}/categories`, categoryForm).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  updateCategory(id: number, categoryForm: CategoryPartial): Observable<Apiresponse> {
    return this.http.patch<Apiresponse>(`${this.endpoint}/categories/${id}`, categoryForm).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  deleteCategory(id: number): Observable<Apiresponse> {
    return this.http.delete<Apiresponse>(`${this.endpoint}/categories/${id}`).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }

  deleteCategories(ids: Array<number>): Observable<Apiresponse> {
    let body = {
      ids: ids
    }
    return this.http.delete<Apiresponse>(`${this.endpoint}/categories`, { body: body }).pipe(
      tap(() => {
        this._refresh$.next()
      })
    )
  }
}
