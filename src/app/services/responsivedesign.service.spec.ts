import { TestBed } from '@angular/core/testing';

import { ResponsivedesignService } from './responsivedesign.service';
import { BreakpointObserver } from '@angular/cdk/layout';

describe('ResponsivedesignService', () => {
  let service: ResponsivedesignService;
  //const responsiveSpy = jasmine.createSpyObj('BreakpointObserver', ['observe', 'isMatched']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      //providers: [{ provide: BreakpointObserver, useValue: responsiveSpy }]
    });
    service = TestBed.inject(ResponsivedesignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a device based on width', (done: DoneFn) => {
    let ancho = window.innerWidth
    
    service.obtenerDispositivo().subscribe((respuesta) => {
      if(ancho < 768) {
        expect(respuesta).toBe('Móvil')
      } else if (ancho > 767 && ancho < 1024) {
        expect(respuesta).toBe('Tablet')
      } else if (ancho > 1023 && ancho < 1440) {
        expect(respuesta).toBe('Portátil')
      } else if (ancho > 1439) {
        expect(respuesta).toBe('Escritorio')
      } else {
        expect(respuesta).toBe('Dispositivo desconocido')
      }
      
      done()
    })
  })
});
