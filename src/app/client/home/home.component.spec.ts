import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { Observable, of, throwError } from 'rxjs';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { appConfig } from '../../app.config';
import { NewsletterService } from '../../services/api/newsletter.service';
import { NewsletterOptional } from '../../interfaces/newsletter';
import { By } from '@angular/platform-browser';

const mockNewsletterService: {
  postNewsletter: (newsletterForm: NewsletterOptional) => Observable<ApiresponsePartial>
} = {
  postNewsletter: () => of({})
}

const mockNewsletterResponse = {
  "message": "Newsletter creada."
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [...appConfig.providers,
        { provide: NewsletterService, useValue: mockNewsletterService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create newsletter, crearNewsletter()', () => {
    const spyCreateNewsletter = spyOn(mockNewsletterService, "postNewsletter")
    spyCreateNewsletter.and.returnValue(of(mockNewsletterResponse))

    // COMPROBAR QUE NO SE LLAMA AL MÉTODO PARA CREAR NEWSLETTER PORQUE EL FORM NO ES VÁLIDO
    component.crearNewsletter()
    expect(mockNewsletterService.postNewsletter).not.toHaveBeenCalled()
    expect(component.newsEnviada.nativeElement.classList.contains('invisible')).toBeTrue()
    expect(component.newsEnviada.nativeElement.classList.contains('text-red-600')).toBeFalse()
    expect(component.newsEnviada.nativeElement.textContent).toBe('¡Inscripción enviada con éxito!')

    // DAMOS VALORES AL FORM
    const newsletterForm = {
      email: "pepe@gmail.com"
    }
    component.newsletterForm.patchValue(newsletterForm)
    component.crearNewsletter()
    expect(mockNewsletterService.postNewsletter).toHaveBeenCalledWith(newsletterForm)
    expect(component.newsEnviada.nativeElement.classList.contains('invisible')).toBeFalse() // El mensaje confirmación del envio de newsletter
    expect(component.newsEnviada.nativeElement.classList.contains('text-red-600')).toBeFalse() // El mensaje no está con color rojo
    expect(component.newsEnviada.nativeElement.textContent).toBe('¡Inscripción enviada con éxito!') // El mensaje del <p>

    // COMPROBAR ENVIO DE NEWSLETTER CON ERROR: COMPORTAMIENTO DEL MENSAJE DEL DOM
    spyCreateNewsletter.and.returnValue(throwError(() => 'Newsletter no creada.'))
    component.crearNewsletter()
    expect(mockNewsletterService.postNewsletter).toHaveBeenCalledWith(newsletterForm)
    expect(component.newsEnviada.nativeElement.classList.contains('invisible')).toBeFalse() // El mensaje confirmación del envio de newsletter
    expect(component.newsEnviada.nativeElement.classList.contains('text-red-600')).toBeTrue() // El mensaje tiene color rojo por el error
    expect(component.newsEnviada.nativeElement.textContent).toBe('Error al enviar tu inscripción') // El mensaje del <p>
  })

  // NO SE CONSIGUE AÑADIR LA CLASE
  it('should scroll horizontally with scroll movement, scrollMovement()', () => {
    const trustElement = document.getElementById("trust")
    trustElement!.style.position = 'absolute'
    trustElement!.style.top = '100px'

    component.scrollMovement()
    expect(trustElement!.classList.contains('dchaizqa')).toBeTrue()
  })
});
