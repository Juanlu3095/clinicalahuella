import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactComponent } from './contact.component';
import { Observable, of, throwError } from 'rxjs';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { MessageService } from '../../services/api/message.service';
import { appConfig } from '../../app.config';
import { By } from '@angular/platform-browser';
import { ResponsivedesignService } from '../../services/responsivedesign.service';

const mockApiResponse = {
  "message": "Respuesta correcta"
}

const mockApiResponseWithData = {
  "message": "Mensajes encontrados.",
  "data": [
    {
      "id": "67EEBF5A15F111F084AFD8BBC1B70204",
      "nombre": "Alberto",
      "apellidos": "Pepep",
      "email": "peasi@gmail.com",
      "telefono": 952222222,
      "asunto": "Hola qué tal payo",
      "mensaje": "Este es el mensaje creado.",
      "created_at": "2025-04-10T09:51:42.000Z",
      "updated_at": "2025-04-25T18:24:24.000Z"
    }
  ]
}

const mockMessageService: {
  getMessages: () => Observable<ApiresponsePartial>,
  getMessage: () => Observable<ApiresponsePartial>,
  postMessage: () => Observable<ApiresponsePartial>,
  updateMessage: () => Observable<ApiresponsePartial>,
  deleteMessage: () => Observable<ApiresponsePartial>,
} = {
  getMessages: () => of(mockApiResponseWithData), // Hacemos que cada método del servicio nos devuelva un observable simulado
  getMessage: () => of(mockApiResponseWithData),
  postMessage: () => of(mockApiResponse),
  updateMessage: () => of(mockApiResponse),
  deleteMessage: () => of(mockApiResponse),
}

describe('ContactComponent', () => {
  let component: ContactComponent; // Componente, clase que lo representa
  let fixture: ComponentFixture<ContactComponent>; // El envoltorio o contexto del componente: HTML + CSS + TS
  let responsiveService: ResponsivedesignService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ // Le pasamos la configuración con metadata
      imports: [ContactComponent],
      providers: [...appConfig.providers, {provide: MessageService, useValue: mockMessageService}, ResponsivedesignService] 
      // Le pasamos los providers de config por ActivatedRoute por las rutas
      // mockeamos el servicio con los valores del mock del servicio
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactComponent); // Creamos un objeto
    component = fixture.componentInstance; // Recuperamos la clase del componente
    responsiveService = TestBed.inject(ResponsivedesignService)
    fixture.detectChanges(); // Indicamos que lo debe cargar todo del onInit. En los test es todo manual, Angular no detecta cambios.
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have h1', () => {
    const elements: HTMLElement = fixture.nativeElement;
    expect(elements.textContent).toContain('CONTACTO')
  })

  it('should have responsive design', () => {
    const resposiveDesignSpy = spyOn(responsiveService, 'obtenerDispositivo')
    resposiveDesignSpy.and.returnValue(of('Dispositivo desconocido'))
    component.ngOnInit() // Ejecutamos el onInit (IMPORTANTE!! EL ONINIT NO SE LLAMA SOLO!!!)
    expect(responsiveService.obtenerDispositivo).toHaveBeenCalled()
  })

  it('should postMessages', () => {
    const postMessageSpy = spyOn(mockMessageService, 'postMessage') // No se puede espiar dos veces al mismo objeto, por eso const

    // HAPPY PATH
    // Espiamos el método del servicio y hacemos que devuelva lo que queramos
    postMessageSpy.and.returnValue(of(mockApiResponse)) // Se pone un of() porque es un observable, lo pusimos en mockMessageService
    // Estamos evaluando que se devuelva el mock en lugar de lo que devuelve normalmente postMessage

    component.contactForm.patchValue({ // Antes de enviar el mensaje rellenamos el formulario
      nombre: "Pepe",
      apellidos: "López",
      email: "plopez@gmail.es",
      telefono: 123456789,
      asunto: "Hola",
      mensaje: "Hola, éste es un mensaje",
    })
    component.enviarMensaje() // Enviamos mensaje desde el componente
    expect(mockMessageService.postMessage).withContext('Llamada a postMessage en el servicio').toHaveBeenCalled() // Comprobamos que el método del servicio se haya llamado con enviarMensaje
  
    // Comprobamos que se haya abierto el modal viendo las clases css al recibir una respuesta correcta
    expect(component.ventanaModal.nativeElement.classList.contains('invisible')).withContext('Abrir modal').toBeFalse() // Podemos usar ventanaModal por ViewChild
    
    const modalDe = fixture.debugElement.query(By.css('.btn-aceptar')) // Botón aceptar del modal
    modalDe.triggerEventHandler('click') // Hacemos click en el botón
    // Comprobamos que el modal esté cerrado
    expect(component.ventanaModal.nativeElement.classList.contains('invisible')).withContext('Cerrar modal').toBeTrue()

    // SAD PATH
    // Mockeamos error de servidor
    postMessageSpy.and.returnValue(throwError(() => 'Error en servidor'))
    component.enviarMensaje() // Enviamos mensaje desde el componente
    expect(mockMessageService.postMessage).withContext('Llamada a postMessage en el servicio sad path').toHaveBeenCalled()
    // Comprobamos que no se haya abierto el modal viendo las clases css al recibir una respuesta incorrecta
    expect(component.ventanaModal.nativeElement.classList.contains('invisible')).withContext('Abrir modal sad path').toBeTrue()
  })
});
