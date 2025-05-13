import { Injectable } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResponsivedesignService {

  constructor(private responsive: BreakpointObserver) { }

  /**
  * Función que devuelve un observable con el dispositivo con el que se navega dependiendo de las media queries personalizadas.
  */
  obtenerDispositivo() {
    return this.responsive.observe(['(max-width: 767px)', '(min-width:768px) and (max-width: 1023px)', '(min-width:1024px) and (max-width: 1439px)', '(min-width: 1440px)']).pipe(
      map( (mediaQuery: BreakpointState) => {
        if(mediaQuery.matches) { 
          if (this.responsive.isMatched('(max-width: 767px)')) {
            return 'Móvil';
          } else if (this.responsive.isMatched('(min-width:768px) and (max-width: 1023px)')) {
            return 'Tablet';
          } else if (this.responsive.isMatched('(min-width:1024px) and (max-width: 1439px)')) {
            return 'Portátil';
          } else if (this.responsive.isMatched('(min-width: 1440px)')) {
            return 'Escritorio';
          } 
          
        } 
        return 'Dispositivo desconocido';
      })
    ) 
  }
}
