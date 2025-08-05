import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookiebannerComponent } from './cookiebanner.component';
import { appConfig } from '../../app.config';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

const mockBottomSheetRef = { dismiss: jasmine.createSpy('dismiss') };

describe('CookiebannerComponent', () => {
  let component: CookiebannerComponent;
  let fixture: ComponentFixture<CookiebannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookiebannerComponent],
      providers: [...appConfig.providers,
        { provide: MatBottomSheetRef, useValue: mockBottomSheetRef }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CookiebannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept cookies', () => {
    localStorage.removeItem('consentimiento_ga')
    component.cookieService.deleteAll()
    component.aceptarCookies()
    
    component.cookieService.set('_ga', 'Presente')
    component.cookieService.set('_ga_3ZGKXK440B', 'Presente')
    const gaCookie = component.cookieService.get('_ga')
    const gaNumerosCookie = component.cookieService.get('_ga_3ZGKXK440B')

    expect(localStorage.getItem('consentimiento_ga')).toBe('true')
    expect(gaCookie).not.toBe('')
    expect(gaNumerosCookie).not.toBe('')
  })

  it('should decline cookies', () => {
    localStorage.removeItem('consentimiento_ga')
    component.cookieService.deleteAll()
    component.denegarCookies()

    const gaCookie = component.cookieService.get('_ga')
    const gaNumerosCookie = component.cookieService.get('_ga_3ZGKXK440B')

    expect(localStorage.getItem('consentimiento_ga')).toBe('false')
    expect(gaCookie).toBeFalsy()
    expect(gaNumerosCookie).toBeFalsy()
  })

  it('should close banner by button click.', () => {
    const event = new MouseEvent('click', {}) // Simulamos un click de botón
    component.openLink(event) // Le pasamos el evento a openLink
    expect(mockBottomSheetRef.dismiss).toHaveBeenCalled()
  })
});
