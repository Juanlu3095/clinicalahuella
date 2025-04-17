import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatatableService {

  public _observable$ = new Subject<void>

  constructor() { }

  // Obtenemos el Observable
  get observable$() {
    return this._observable$;
  }

}
