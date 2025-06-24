import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { BookComponent } from './book.component';
import { Observable, of, throwError } from 'rxjs';
import { ResponsivedesignService } from '../../services/responsivedesign.service';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { BookService } from '../../services/api/book.service';
import { appConfig } from '../../app.config';
import { MatSnackBar } from '@angular/material/snack-bar';

const mockResponsiveService: {
  obtenerDispositivo: () =>  Observable<"Móvil" | "Tablet" | "Portátil" | "Escritorio" | "Dispositivo desconocido">
} = {
  obtenerDispositivo: () => of("Escritorio")
}

const mockBookingsServiceResponse = {
  "message": "Reserva creada."
}

const mockBookingService: {
  postBooking: () => Observable<ApiresponsePartial>
} = {
  postBooking: () => of(mockBookingsServiceResponse)
}

// Creamos un espia con createSpyObj en lugar de spyOn porque no tenemos una instancia de MatSnackBa, Angular la crea y la inyecta directamente
const mockSnackbar = jasmine.createSpyObj(['open']); // Creamos un objeto sin nombre ni clase, sólo con la propiedad 'open', la cual espia al metodo open() de MatSnackBar

describe('BookComponent', () => {
  let component: BookComponent;
  let fixture: ComponentFixture<BookComponent>;
  let responsiveService: ResponsivedesignService;
  let bookingService: BookService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookComponent],
      providers: [
        ...appConfig.providers,
        { provide: BookService, useValue: mockBookingService },
        { provide: ResponsivedesignService, useValue: mockResponsiveService },
        { provide: MatSnackBar, useValue: mockSnackbar },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookComponent);
    responsiveService = TestBed.inject(ResponsivedesignService)
    bookingService = TestBed.inject(BookService)
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the right tags and title for SEO', () => {
    const descriptionTag = component.meta.getTag('name=description')?.content
    const keywordsTag = component.meta.getTag('name=keywords')?.content
    const title = component.title.getTitle()

    expect(descriptionTag).toBe("Reserva cita para tu mascota en nuestra clínica veterinaria de Málaga.")
    expect(keywordsTag).toBe("reserva cita, cita mascota, clínica málaga")
    expect(title).toBe('Reservar cita - Clínica veterinaria La Huella')
  })

  it('should post a booking', async () => {
    const bookingServiceSpy = spyOn(bookingService, 'postBooking')
    bookingServiceSpy.and.returnValue(of(mockBookingsServiceResponse))

    const bookingForm = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: new Date('2025-06-18'),
      hora: '18:00',
    }

    const booking = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: new Date('2025-06-18').toLocaleDateString('en-CA'), // Dentro de solicitarReserva se hace esta transformación
      hora: '18:00',
    }

    component.bookForm.patchValue(bookingForm)
    component.solicitarReserva()
    
    expect(mockBookingService.postBooking).toHaveBeenCalled()
    expect(bookingService.postBooking).toHaveBeenCalledWith(booking)
    expect(mockSnackbar.open).toHaveBeenCalledWith('Reserva realizada.', 'Aceptar', { duration: 3000, })

    // INCORRECT: 500
    bookingServiceSpy.and.returnValue(throwError(() => 'Reserva no creada.'))
    component.solicitarReserva()

    expect(mockBookingService.postBooking).toHaveBeenCalled()
    expect(mockSnackbar.open).toHaveBeenCalledWith('Ha ocurrido un error. Reserva no creada.', 'Aceptar', { duration: 3000, })
  })

  it('should have responsive design', () => {
    const responsiveServiceSpy = spyOn(responsiveService, 'obtenerDispositivo')
    responsiveServiceSpy.and.returnValue(of("Escritorio"))
  
    component.ngOnInit()
  
    expect(responsiveService.obtenerDispositivo).toHaveBeenCalled()
  })
});

