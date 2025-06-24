import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasComponent } from './reservas.component';
import { By } from '@angular/platform-browser';
import { DatatableComponent } from '../../partials/datatable/datatable.component';
import { Observable, of, Subject, throwError } from 'rxjs';
import { appConfig } from '../../app.config';
import { ResponsivedesignService } from '../../services/responsivedesign.service';
import { BookService } from '../../services/api/book.service';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { DialogService } from '../../services/material/dialog.service';
import { BookingPartial } from '../../interfaces/book';
import { MatSnackBar } from '@angular/material/snack-bar';

// Mock de la respuesta que no devuelve datos
const mockApiResponse = {
  "message": "Respuesta correcta"
}

// Mock de la respuesta que devuelve datos
const mockApiResponseWithData = {
  "message": "Reservas encontradas.",
  "data": [
    {
      "id": "1C1E2A0D4D0311F08DAED8BBC1B70204",
      "nombre": "Pepe",
      "apellidos": "Gutiérrez Codes",
      "email": "pgutierrezcodes@hotmail.com",
      "telefono": "1234",
      "fecha": "2025-06-26T22:00:00.000Z",
      "hora": "18:00:00"
    },
    {
      "id": "EC58142A4C7011F09077D8BBC1B70204",
      "nombre": "Francisca",
      "apellidos": "Serrano",
      "email": "fserrano@gmail.com",
      "telefono": "665587787",
      "fecha": "2025-06-29T22:00:00.000Z",
      "hora": "18:30:00"
    }
  ]
}

const mockApiResponseWithOneData = {
  "message": "Reserva encontrada.",
  "data": {
    "id": "1C1E2A0D4D0311F08DAED8BBC1B70204",
    "nombre": "Pepe",
    "apellidos": "Gutiérrez Codes",
    "email": "pgutierrezcodes@hotmail.com",
    "telefono": "1234",
    "fecha": "2025-06-26T22:00:00.000Z",
    "hora": "18:00:00"
  }
}

// Mock del servicio con sus propiedades y métodos
const mockBookingsService: {
  refresh$: Subject<void>,
  getAllBookings: () => Observable<ApiresponsePartial>,
  getBooking: (id: string) => Observable<ApiresponsePartial>,
  postBooking: (book: BookingPartial) => Observable<ApiresponsePartial>,
  updateBooking: (id: string, book: BookingPartial) => Observable<ApiresponsePartial>,
  deleteBooking: (id: string) => Observable<ApiresponsePartial>,
  deleteBookings: (ids: Array<string>) => Observable<ApiresponsePartial>,
} = {
  refresh$: new Subject<void>(),
  getAllBookings: () => of(mockApiResponseWithData), // Hacemos que cada método del servicio nos devuelva un observable simulado
  getBooking: () => of(mockApiResponseWithOneData),
  postBooking: () => of(mockApiResponse),
  updateBooking: () => of(mockApiResponse),
  deleteBooking: () => of(mockApiResponse),
  deleteBookings: () => of(mockApiResponse),
}

const mockResponsiveService: {
  obtenerDispositivo: () =>  Observable<"Móvil" | "Tablet" | "Portátil" | "Escritorio" | "Dispositivo desconocido">
} = {
  obtenerDispositivo: () => of("Escritorio")
}

const mockDialogService: {
  openDialog: () => Promise<any>
} = {
  openDialog: () => Promise.resolve('confirm')
}

// Creamos un espia con createSpyObj en lugar de spyOn porque no tenemos una instancia de MatSnackBa, Angular la crea y la inyecta directamente
const mockSnackbar = jasmine.createSpyObj(['open']); // Creamos un objeto sin nombre ni clase, sólo con la propiedad 'open', la cual espia al metodo open() de MatSnackBar

describe('ReservasComponent', () => {
  let component: ReservasComponent;
  let fixture: ComponentFixture<ReservasComponent>;
  let responsiveService: ResponsivedesignService;
  let bookingService: BookService;
  let dialogService: DialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasComponent],
      providers: [
        ...appConfig.providers,
        { provide: ResponsivedesignService, useValue: mockResponsiveService },
        { provide: BookService, useValue: mockBookingsService },
        { provide: DialogService, useValue: mockDialogService },
        { provide: MatSnackBar, useValue: mockSnackbar },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservasComponent);
    responsiveService = TestBed.inject(ResponsivedesignService)
    bookingService = TestBed.inject(BookService)
    dialogService = TestBed.inject(DialogService)
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get all bookings, getReservas()', () => {
    const bookingsServiceSpy = spyOn(bookingService, 'getAllBookings')
    bookingsServiceSpy.and.returnValue(of(mockApiResponseWithData))
    component.getReservas()
    expect(mockBookingsService.getAllBookings).toHaveBeenCalled()
  })

  it('should open modal to see booking, modalVerReserva()', async () => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    dialogServiceSpy.and.returnValue(Promise.resolve('confirm'))
    const bookingsServiceSpy = spyOn(bookingService, 'getBooking')
    bookingsServiceSpy.and.returnValue(of(mockApiResponseWithOneData))

    const id = '1C1E2A0D4D0311F08DAED8BBC1B70204'

    await component.modalVerReserva(id) // Esta promesa se debe completar clickando el botón
    expect(mockDialogService.openDialog).toHaveBeenCalled()
    expect(mockBookingsService.getBooking).toHaveBeenCalledWith(id)
  })

  it('should get booking by id, getReserva()', () => {
    const bookingsServiceSpy = spyOn(bookingService, 'getBooking')
    bookingsServiceSpy.and.returnValue(of(mockApiResponseWithOneData))
    const id = '1C1E2A0D4D0311F08DAED8BBC1B70204'

    component.getReserva(id)
    expect(mockBookingsService.getBooking).toHaveBeenCalledWith(id)

    // RESPUESTA: 404
    bookingsServiceSpy.and.returnValue(throwError(() => 'Reserva no encontrada.'))
    component.reserva = {} // Hacemos que vuelva a estar vacío, como al principio
    component.getReserva(id) // Volvemos a llamar al método para obtener la reserva
    expect(mockBookingsService.getBooking).toHaveBeenCalledWith(id)
    expect(component.reserva).toEqual({})
  })

  it('should open modal to create a booking, modalCrearReserva()', async () => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    dialogServiceSpy.and.returnValue(Promise.resolve('confirm')) // La promesa devuelve 'confirm' por lo que se llama a crearReserva si el formulario es válido
    const bookingsServiceSpy = spyOn(bookingService, 'postBooking')
    bookingsServiceSpy.and.returnValue(of(mockApiResponse))

    // Formulario no cumplimentado: no se llama correctamente a crearReserva porque el form no es válido
    await component.modalCrearReserva()
    expect(dialogService.openDialog).toHaveBeenCalled()
    expect(mockBookingsService.postBooking).not.toHaveBeenCalled()

    const reservaForm = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '18:00',
    }

    component.nuevaReservaForm.patchValue({
      nombre_nuevo: 'Javier',
      apellidos_nuevo: 'Lozano',
      email_nuevo: 'jlozano@gmail.com',
      telefono_nuevo: '640876911',
      fecha_nuevo: new Date('2025-06-18'),
      hora_nuevo: '18:00',
    })

    // Formulario cumplimentado: se llama correctamente a crearReserva
    await component.modalCrearReserva()
    expect(dialogService.openDialog).toHaveBeenCalled()
    expect(mockBookingsService.postBooking).toHaveBeenCalledWith(reservaForm)
  })

  it('should create a booking, crearReserva()', () => {
    const bookingsServiceSpy = spyOn(bookingService, 'postBooking')
    bookingsServiceSpy.and.returnValue(of(mockApiResponse))

    const reservaForm = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '18:00',
    }

    component.nuevaReservaForm.patchValue({
      nombre_nuevo: 'Javier',
      apellidos_nuevo: 'Lozano',
      email_nuevo: 'jlozano@gmail.com',
      telefono_nuevo: '640876911',
      fecha_nuevo: new Date('2025-06-18'),
      hora_nuevo: '18:00',
    })

    component.crearReserva()
    expect(mockBookingsService.postBooking).toHaveBeenCalledWith(reservaForm)
  })

  it('should open modal to edit a booking, modalEditarReserva()', async () => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    const bookingsServiceSpy = spyOn(bookingService, 'updateBooking')
    const id = '1C1E2A0D4D0311F08DAED8BBC1B70204'
    
    // No se pulsa el botón de confirmar
    dialogServiceSpy.and.returnValue(Promise.resolve()) // La promesa devuelve 'confirm' por lo que se llama a editarReserva si el formulario es válido
    await component.modalEditarReserva(id)
    expect(dialogService.openDialog).toHaveBeenCalled()
    expect(mockBookingsService.updateBooking).not.toHaveBeenCalled()

    const reservaForm = {
      nombre: 'Pepe',
      apellidos: 'Gutiérrez Codes',
      email: 'pgutierrezcodes@hotmail.com',
      telefono: '1234',
      fecha: '2025-06-27',
      hora: '18:00'
    }

    // Formulario cumplimentado: se llama correctamente a crearReserva
    dialogServiceSpy.and.returnValue(Promise.resolve('confirm')) // Al poner 'confirm' también se llamará a updateBooking del servicio
    bookingsServiceSpy.and.returnValue(of(mockApiResponse))
    await component.modalEditarReserva(id) // Al abrir el modal aparecen los datos de la reserva ya existente, POR ESO no se puede usar patchValue y esperar esos datos en el form
    expect(dialogService.openDialog).toHaveBeenCalled()
    expect(mockBookingsService.updateBooking).withContext('Formulario válido').toHaveBeenCalledWith(id, reservaForm)

    // RESPUESTA: 404
    const reservaFormNoData = {
      nombre_editar: '',
      apellidos_editar: '',
      email_editar: '',
      telefono_editar: '',
      fecha_editar: new Date,
      hora_editar: '',
    }

    component.editarReservaForm.patchValue({
      nombre_editar: '',
      apellidos_editar: '',
      email_editar: '',
      telefono_editar: '',
      fecha_editar: new Date,
      hora_editar: '',
    })

    const getBookingServiceSpy = spyOn(bookingService, 'getBooking')
    getBookingServiceSpy.and.returnValue(throwError(() => ({
      status: 404,
      message: 'Reserva no encontrada.'
    })))
    await component.modalEditarReserva(id)
    expect(dialogService.openDialog).toHaveBeenCalled()
    expect(mockBookingsService.getBooking).toHaveBeenCalledWith(id)
    expect(component.editarReservaForm.value).toEqual(reservaFormNoData) // Como no se encuentra la reserva, el form está vacío
  })

  it('should update a booking, editarReserva()', () => {
    const bookingsServiceSpy = spyOn(bookingService, 'updateBooking')
    bookingsServiceSpy.and.returnValue(of(mockApiResponse))
    const id = '1C1E2A0D4D0311F08DAED8BBC1B70204'

    const reservaForm = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '18:00',
    }

    component.editarReservaForm.patchValue({
      nombre_editar: 'Javier',
      apellidos_editar: 'Lozano',
      email_editar: 'jlozano@gmail.com',
      telefono_editar: '640876911',
      fecha_editar: new Date('2025-06-18'),
      hora_editar: '18:00',
    })

    component.editarReserva(id)
    expect(mockBookingsService.updateBooking).toHaveBeenCalledWith(id, reservaForm)
  })

  it('should open modal to delete a booking by id, modalEliminarReserva()', async () => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    const getBookingsServiceSpy = spyOn(bookingService, 'getBooking')
    const deleteBookingsServiceSpy = spyOn(bookingService, 'deleteBooking')
    const id = '1C1E2A0D4D0311F08DAED8BBC1B70204'

    // Reserva no encontrada
    component.reserva = {}
    getBookingsServiceSpy.and.returnValue(throwError(() => 'Reserva no encontrada.'))
    dialogServiceSpy.and.returnValue(Promise.resolve())
    await component.modalEliminarReserva(id)
    expect(component.reserva).toEqual({})
    expect(mockDialogService.openDialog).not.toHaveBeenCalled()
    expect(mockBookingsService.getBooking).toHaveBeenCalledWith(id)
    expect(mockBookingsService.deleteBooking).not.toHaveBeenCalled()

    // Reserva encontrada, pero no se confirma la eliminación de la reservar
    dialogServiceSpy.and.returnValue(Promise.resolve())
    getBookingsServiceSpy.and.returnValue(of(mockApiResponseWithOneData))
    deleteBookingsServiceSpy.and.returnValue(of(mockApiResponse))
    await component.modalEliminarReserva(id)
    expect(mockDialogService.openDialog).toHaveBeenCalled()
    expect(mockBookingsService.getBooking).toHaveBeenCalledWith(id)
    expect(component.reserva.id).toBe(id)
    expect(mockBookingsService.deleteBooking).not.toHaveBeenCalledWith(id)

    // Reserva encontrada, eliminación confirmada
    dialogServiceSpy.and.returnValue(Promise.resolve('confirm'))
    await component.modalEliminarReserva(id)
    expect(mockDialogService.openDialog).toHaveBeenCalled()
    expect(mockBookingsService.getBooking).toHaveBeenCalledWith(id)
    expect(component.reserva.id).toBe(id)
    expect(mockBookingsService.deleteBooking).toHaveBeenCalledWith(id)
  })

  it('should delete a booking, eliminarReserva()', () => {
    const bookingsServiceSpy = spyOn(bookingService, 'deleteBooking')
    bookingsServiceSpy.and.returnValue(of(mockApiResponse))
    const id = '1C1E2A0D4D0311F08DAED8BBC1B70204'

    component.eliminarReserva(id)
    expect(mockBookingsService.deleteBooking).toHaveBeenCalledWith(id)
  })

  it('should open a modal to select bookings to delete, modalEliminarSeleccionNewsletters()', async () => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    const deleteBookingsServiceSpy = spyOn(bookingService, 'deleteBookings')
    const ids = ['1C1E2A0D4D0311F08DAED8BBC1B70204', 'EC58142A4C7011F09077D8BBC1B70204']
    component.selectedIds = ids

    // Eliminación no confirmada
    dialogServiceSpy.and.returnValue(Promise.resolve())
    await component.modalEliminarSeleccionReservas()
    expect(mockDialogService.openDialog).toHaveBeenCalled()
    expect(mockBookingsService.deleteBookings).not.toHaveBeenCalled()

    // Eliminación confirmada, con error
    dialogServiceSpy.and.returnValue(Promise.resolve('confirm'))
    deleteBookingsServiceSpy.and.returnValue(throwError(() => 'Reservas no encontradas'))
    await component.modalEliminarSeleccionReservas()
    expect(mockDialogService.openDialog).toHaveBeenCalled()
    expect(mockBookingsService.deleteBookings).toHaveBeenCalledWith(ids)
    
    // Eliminación confirmada, todo correcto
    deleteBookingsServiceSpy.and.returnValue(of(mockApiResponse))
    await component.modalEliminarSeleccionReservas()
    expect(mockDialogService.openDialog).toHaveBeenCalled()
    expect(mockBookingsService.deleteBookings).toHaveBeenCalledWith(ids)
  })

  it('should delete a selection of bookings, eliminarReservas()', () => {
    const bookingsServiceSpy = spyOn(bookingService, 'deleteBookings')
    bookingsServiceSpy.and.returnValue(of(mockApiResponse))
    const ids = ['1C1E2A0D4D0311F08DAED8BBC1B70204', 'EC58142A4C7011F09077D8BBC1B70204']

    component.selectedIds = ids

    // Todo correcto
    component.eliminarReservas()
    expect(mockBookingsService.deleteBookings).toHaveBeenCalledWith(ids)
    expect(mockSnackbar.open).toHaveBeenCalledWith('Reservas eliminadas.', 'Aceptar', { duration: 3000, })

    // Error 404
    bookingsServiceSpy.and.returnValue(throwError(() => ({ // Simulamos un error 404 de la API
      status: 404,
      message: 'Reservas no encontradas.'
    })))
    component.eliminarReservas()
    expect(mockBookingsService.deleteBookings).toHaveBeenCalledWith(ids)
    expect(mockSnackbar.open).toHaveBeenCalledWith('Reservas no encontradas.', 'Aceptar', { duration: 3000, })

    // Error genérico
    bookingsServiceSpy.and.returnValue(throwError(() => ({ // Simulamos un error genérico de la API
      status: 500,
      message: 'Ha ocurrido un error.'
    })))
    component.eliminarReservas()
    expect(mockBookingsService.deleteBookings).toHaveBeenCalledWith(ids)
    expect(mockSnackbar.open).toHaveBeenCalledWith('Ha ocurrido un error.', 'Aceptar', { duration: 3000, })
  })

  it('should call onSelectionChange when clicking mat-checkbox', () => {
    const onSelectionSpy = spyOn(component, 'onSelectionChange'); // crea espía para onSelectionChange del componente
  
    fixture.detectChanges(); // Renderiza la tabla
  
    // Localiza el elemento del HTML de newsletters asociado a datatable
    const datatableDE = fixture.debugElement.query(By.directive(DatatableComponent));
    // Accede al componente datatable y sus propiedades mediante una instancia.
    // Como si fuera TestBed.inject(datatableComponent)
    const datatableComponent = datatableDE.componentInstance as DatatableComponent<any>;
  
    // selectionChange es un output de datatable que emite hacia el padre: (selectionChange)="onSelectionChange($event)" en el HTML
    // Hace que se ejecute onSelectionChange de newsletters.component
    datatableComponent.selectionChange.emit(['fakeId']); // Hacemos que emita manualmente algo y que lo capte el componente
  
    expect(onSelectionSpy).toHaveBeenCalledWith(['fakeId']);
  })

  it('should have responsive design', () => {
    const responsiveServiceSpy = spyOn(responsiveService, 'obtenerDispositivo')
    responsiveServiceSpy.and.returnValue(of("Escritorio"))
    
    component.ngOnInit()
    
    expect(responsiveService.obtenerDispositivo).toHaveBeenCalled()
  })
});
