import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotfoundComponent } from './notfound.component';
import { appConfig } from '../../app.config';
import { of } from 'rxjs';
import { UrlSegment } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('NotfoundComponent', () => {
  let component: NotfoundComponent;
  let fixture: ComponentFixture<NotfoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotfoundComponent],
      providers: [...appConfig.providers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotfoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    expect(component.title.getTitle()).toBe('Página no encontrada - Clínica veterinaria La Huella')
  })

  it('should save url partial into nombrePerro, obtenerNombrePerro()', () => {
    const mockSegments: UrlSegment[] = [ // Array de objetos
      new UrlSegment('Prueba', {})
    ];

    component.activatedRoute.url = of(mockSegments)
    component.obtenerNombrePerro()
    expect(component.nombrePerro).toBe('Prueba')
  })

  it('should get date and do a pipe format into HTML, obtenerFecha()', () => {
    component.fecha = new Date('Thu Jun 26 2025 00:55:19 GMT+0200')
    const fechaDatepipeES = fixture.debugElement.query(By.css('.fecha'))
    expect(fechaDatepipeES.nativeElement.innerHTML).toBe('Se perdió el jueves, 26 de junio de 2025.')
  })
});
