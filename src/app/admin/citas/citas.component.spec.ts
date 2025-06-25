import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { CitasComponent } from './citas.component';
import { Observable, of, Subject, throwError } from 'rxjs';
import { appConfig } from '../../app.config';
import { ResponsivedesignService } from '../../services/responsivedesign.service';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { AppointmentPartial } from '../../interfaces/appointment';
import { BookService } from '../../services/api/book.service';
import { AppointmentService } from '../../services/api/appointment.service';
import { DialogService } from '../../services/material/dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TemplateRef } from '@angular/core';

const mockResponsiveService: {
  obtenerDispositivo: () =>  Observable<"Móvil" | "Tablet" | "Portátil" | "Escritorio" | "Dispositivo desconocido">
} = {
  obtenerDispositivo: () => of("Escritorio")
}

// Mock de la respuesta que no devuelve datos
const mockApiResponse = {
  "message": "Respuesta correcta"
}

// Mock de la respuesta de la API para las reservas
const mockApiBookingResponseWithData = {
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

// Mock de la respuesta de la API para las reservas
const mockApiAppointmentsResponseWithData = {
  "message": "Citas encontradas.",
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

const formatedMockAppointments = [
  {id: '1C1E2A0D4D0311F08DAED8BBC1B70204', title: 'Pepe Gutiérrez Codes', start: '2025-06-27'},
  {id: 'EC58142A4C7011F09077D8BBC1B70204', title: 'Francisca Serrano', start: '2025-06-30'}
]

const mockApiAppointmentResponseWithOneData = {
  "message": "Cita encontrada.",
  "data": [
    {
      "id": "1C1E2A0D4D0311F08DAED8BBC1B70204",
      "nombre": "Pepe",
      "apellidos": "Gutiérrez Codes",
      "email": "pgutierrezcodes@hotmail.com",
      "telefono": "1234",
      "fecha": "2025-06-26T22:00:00.000Z",
      "hora": "18:00:00"
    }
  ]
}

// Mock del servicio de reservas con sus propiedades y métodos
const mockBookingsService: {
  refresh$: Subject<void>,
  getAllBookings: () => Observable<ApiresponsePartial>,
  deleteBooking: (id: string) => Observable<ApiresponsePartial>
} = {
  refresh$: new Subject<void>(),
  getAllBookings: () => of(mockApiBookingResponseWithData),
  deleteBooking: () => of(mockApiResponse)
}

// Mock del servicio de citas con sus propiedades y métodos
const mockAppointmentsService: {
  refresh$: Subject<void>,
  getAllAppointments: () => Observable<ApiresponsePartial>,
  getAppointment: (id: string) => Observable<ApiresponsePartial>,
  postAppointment: (appointment: AppointmentPartial) => Observable<ApiresponsePartial>,
  updateAppointment: (id: string, appointment: AppointmentPartial) => Observable<ApiresponsePartial>,
  deleteAppointment: (id: string) => Observable<ApiresponsePartial>
} = {
  refresh$: new Subject<void>(),
  getAllAppointments: () => of(mockApiAppointmentsResponseWithData), // Hacemos que cada método del servicio nos devuelva un observable simulado
  getAppointment: () => of(mockApiAppointmentResponseWithOneData),
  postAppointment: () => of(mockApiResponse),
  updateAppointment: () => of(mockApiResponse),
  deleteAppointment: () => of(mockApiResponse)
}

const mockDialogService: {
  openDialog: ({html, title, btnCancel, btnClass}: {html?: TemplateRef<HTMLElement>, title?: string, btnCancel?: string, btnClass?: string}) => Promise<any>,
  closeAll: () => void
} = {
  openDialog: () => Promise.resolve('confirm'),
  closeAll: () => {}
}

// Creamos un espia con createSpyObj en lugar de spyOn porque no tenemos una instancia de MatSnackBa, Angular la crea y la inyecta directamente
const mockSnackbar = jasmine.createSpyObj(['open']); // Creamos un objeto sin nombre ni clase, sólo con la propiedad 'open', la cual espia al metodo open() de MatSnackBar

describe('CitasComponent', () => {
  let component: CitasComponent;
  let fixture: ComponentFixture<CitasComponent>;
  let responsiveService: ResponsivedesignService;
  let bookingService: BookService;
  let appointmentService: AppointmentService;
  let dialogService: DialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitasComponent],
      providers: [...appConfig.providers,
        { provide: ResponsivedesignService, useValue: mockResponsiveService },
        { provide: BookService, useValue: mockBookingsService },
        { provide: AppointmentService, useValue: mockAppointmentsService },
        { provide: DialogService, useValue: mockDialogService },
        { provide: MatSnackBar, useValue: mockSnackbar },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitasComponent);
    responsiveService = TestBed.inject(ResponsivedesignService)
    bookingService = TestBed.inject(BookService)
    appointmentService = TestBed.inject(AppointmentService)
    dialogService = TestBed.inject(DialogService)
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy() // Se elimina el componente tras cada test, eliminando suscripciones y otras operaciones pendientes
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    expect(component.title.getTitle()).toBe('Citas < Clínica veterinaria La Huella')
  })

  it('should get all appointments, getCitas()', () => {
    const appointmentsServiceSpy = spyOn(appointmentService, 'getAllAppointments')
    appointmentsServiceSpy.and.returnValue(of(mockApiAppointmentsResponseWithData))
    component.getCitas()

    // Todo correcto
    expect(mockAppointmentsService.getAllAppointments).toHaveBeenCalled()
    expect(component.calendarOptions.events).toEqual(formatedMockAppointments)

    // Error
    appointmentsServiceSpy.and.returnValue(throwError(() => ({ // Simulamos un error de la API
      status: 500,
      message: 'Ha ocurrido un error.'
    })))
    component.getCitas()
    expect(mockAppointmentsService.getAllAppointments).toHaveBeenCalled()
    expect(mockSnackbar.open).toHaveBeenCalledWith('No se ha podido obtener las citas.', 'Aceptar', { duration: 3000, })
  })

  it('should get see an appointment in dialog, verEvento()', async () => {
    const appointmentsServiceSpy = spyOn(appointmentService, 'getAppointment')
    appointmentsServiceSpy.and.returnValue(of(mockApiAppointmentResponseWithOneData))
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    const id = '1C1E2A0D4D0311F08DAED8BBC1B70204'

    await component.verEvento(id)

    // Todo correcto
    expect(mockAppointmentsService.getAppointment).toHaveBeenCalledWith(id)
    expect(mockDialogService.openDialog).toHaveBeenCalledWith({html: component.modalVer, title: 'Ver cita'})
  })

  it('should get an appointment, getCita()', () => {
    const appointmentsServiceSpy = spyOn(appointmentService, 'getAppointment')
    appointmentsServiceSpy.and.returnValue(of(mockApiAppointmentResponseWithOneData))
    const id = '1C1E2A0D4D0311F08DAED8BBC1B70204'

    component.getCita(id)

    // Todo correcto
    expect(mockAppointmentsService.getAppointment).toHaveBeenCalledWith(id)
    expect(component.cita.id).toEqual(id)

    // Error 404
    appointmentsServiceSpy.and.returnValue(throwError(() => ({ // Simulamos un error 404 de la API
      status: 404,
      message: 'Cita no encontrada.'
    })))
    component.getCita(id)
    expect(mockAppointmentsService.getAppointment).toHaveBeenCalledWith(id)
    expect(mockSnackbar.open).toHaveBeenCalledWith('Cita no encontrada.', 'Aceptar', { duration: 3000, })
  })

  it('should show a modal to create an appointment, modalCrearCita()', async () => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    dialogServiceSpy.and.returnValue(Promise.resolve())
    const appointmentsServiceSpy = spyOn(appointmentService, 'postAppointment')
    appointmentsServiceSpy.and.returnValue(of(mockApiResponse))
    
    // Formulario no cumplimentado: no se llama correctamente a crearCita porque el form no es válido
    await component.modalCrearCita()
    expect(mockDialogService.openDialog).toHaveBeenCalledWith({html: component.modalNuevo, title: 'Nueva cita', btnCancel: 'cancelar', btnClass: 'guardar'})
    expect(mockAppointmentsService.postAppointment).not.toHaveBeenCalled()
    
    const citaForm = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '18:00',
    }
    
    component.nuevaCitaForm.patchValue({
      nombre_nuevo: 'Javier',
      apellidos_nuevo: 'Lozano',
      email_nuevo: 'jlozano@gmail.com',
      telefono_nuevo: '640876911',
      fecha_nuevo: new Date('2025-06-18'),
      hora_nuevo: '18:00',
    })
    
    // Formulario cumplimentado: se llama correctamente a crearReserva
    dialogServiceSpy.and.returnValue(Promise.resolve('confirm')) // Se confirma cuando se pulsa el botón guardar en el modal
    await component.modalCrearCita()
    expect(mockDialogService.openDialog).toHaveBeenCalledWith({html: component.modalNuevo, title: 'Nueva cita', btnCancel: 'cancelar', btnClass: 'guardar'})
    expect(mockAppointmentsService.postAppointment).toHaveBeenCalledWith(citaForm)
  })

  it('should create an appointment, crearCita()', () => {
    const appointmentsServiceSpy = spyOn(appointmentService, 'postAppointment')
    
    const citaForm = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '18:00',
    }

    component.nuevaCitaForm.patchValue({
      nombre_nuevo: 'Javier',
      apellidos_nuevo: 'Lozano',
      email_nuevo: 'jlozano@gmail.com',
      telefono_nuevo: '640876911',
      fecha_nuevo: new Date('2025-06-18'),
      hora_nuevo: '18:00',
    })

    // Respuesta de la API: 500
    appointmentsServiceSpy.and.returnValue(throwError(() => ({ // Simulamos un error 404 de la API
      status: 500,
      message: 'Cita no creada.'
    })))
    component.crearCita()
    expect(mockAppointmentsService.postAppointment).toHaveBeenCalledWith(citaForm)
    expect(mockSnackbar.open).toHaveBeenCalledWith('Cita creada.', 'Aceptar', { duration: 3000, })

    // Respuesta de la API correcta
    appointmentsServiceSpy.and.returnValue(of(mockApiResponse))
    component.crearCita()
    expect(mockAppointmentsService.postAppointment).toHaveBeenCalledWith(citaForm)
    expect(mockSnackbar.open).toHaveBeenCalledWith('No se ha podido crear la cita.', 'Aceptar', { duration: 3000, })
  })

  it('should show a modal to update an appointment, modalEditarCita()', async () => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    dialogServiceSpy.and.returnValue(Promise.resolve())
    const appointmentsServiceSpy = spyOn(appointmentService, 'updateAppointment')
    appointmentsServiceSpy.and.returnValue(of(mockApiResponse))
    const id = '1C1E2A0D4D0311F08DAED8BBC1B70204'

    // No se pulsa el botón de confirmar
    await component.modalEditarCita(id)
    expect(mockDialogService.openDialog).toHaveBeenCalledWith({html: component.modalEditar, title: 'Editar cita', btnCancel: 'cancelar', btnClass: 'guardar'})
    expect(mockAppointmentsService.updateAppointment).not.toHaveBeenCalled()
    
    // Se pulsa el botón de confirmar. No se parchea el formulario porque ya le inserta los datos con getCita() al abrir el modal
    dialogServiceSpy.and.returnValue(Promise.resolve('confirm'))
    await component.modalEditarCita(id)
    expect(mockDialogService.openDialog).toHaveBeenCalledWith({html: component.modalEditar, title: 'Editar cita', btnCancel: 'cancelar', btnClass: 'guardar'})
    expect(mockAppointmentsService.updateAppointment).toHaveBeenCalled() // Nos da igual qué datos le llegue al servicio, pues eso lo comprobamos en el siguiente test
  })

  it('should update an appointment, editarCita()', () => {
    const dialogServiceSpy = spyOn(dialogService, 'closeAll')
    dialogServiceSpy.and.returnValue()
    const appointmentsServiceSpy = spyOn(appointmentService, 'updateAppointment')
    const id = '1C1E2A0D4D0311F08DAED8BBC1B70204'

    // Formulario no válido
    appointmentsServiceSpy.and.returnValue(of(mockApiResponse))
    component.editarCita(id)
    expect(mockAppointmentsService.updateAppointment).not.toHaveBeenCalled()

    // Formulario válido pero error 404
    const citaForm = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '18:00',
    }

    component.editarCitaForm.patchValue({
      nombre_editar: 'Javier',
      apellidos_editar: 'Lozano',
      email_editar: 'jlozano@gmail.com',
      telefono_editar: '640876911',
      fecha_editar: new Date('2025-06-18'),
      hora_editar: '18:00',
    })

    appointmentsServiceSpy.and.returnValue(throwError(() => ({ // Simulamos un error 404 de la API
      status: 404,
      message: 'Cita no encontrada.'
    })))
    component.editarCita(id)
    expect(mockAppointmentsService.updateAppointment).toHaveBeenCalledWith(id, citaForm)
    expect(mockSnackbar.open).toHaveBeenCalledWith('Cita no actualizada.', 'Aceptar', { duration: 3000, })

    // Formulario válido
    appointmentsServiceSpy.and.returnValue(of(mockApiResponse))
    component.editarCita(id)
    expect(mockSnackbar.open).toHaveBeenCalledWith('Cita actualizada.', 'Aceptar', { duration: 3000, })
    expect(mockDialogService.closeAll).toHaveBeenCalled()
  })

  it('should show a modal to delete an appointment, modalEliminarCita()', async () => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    const deleteAppointmentSpy = spyOn(appointmentService, 'deleteAppointment')
    const id = '1C1E2A0D4D0311F08DAED8BBC1B70204'
    
    // Sin pulsar el botón de confirmar
    dialogServiceSpy.and.returnValue(Promise.resolve())
    await component.modalEliminarCita(id)
    expect(mockDialogService.openDialog).toHaveBeenCalledWith({html: component.modalEliminar, title: 'Eliminar cita', btnCancel: 'cancelar', btnClass: 'eliminar'})
    expect(mockAppointmentsService.deleteAppointment).not.toHaveBeenCalled()
    
    // Al pulsar en el botón de confirmar
    dialogServiceSpy.and.returnValue(Promise.resolve('confirm'))
    deleteAppointmentSpy.and.returnValue(of(mockApiResponse))
    await component.modalEliminarCita(id)
    expect(mockDialogService.openDialog).toHaveBeenCalledWith({html: component.modalEliminar, title: 'Eliminar cita', btnCancel: 'cancelar', btnClass: 'eliminar'})
    expect(mockAppointmentsService.deleteAppointment).toHaveBeenCalledWith(id)
  })

  it('should delete an appointment, eliminarCita()', () => {
    const dialogServiceSpy = spyOn(dialogService, 'closeAll')
    dialogServiceSpy.and.returnValue()
    const deleteAppointmentSpy = spyOn(appointmentService, 'deleteAppointment')
    const id = '1C1E2A0D4D0311F08DAED8BBC1B70204'

    // Error 404
    deleteAppointmentSpy.and.returnValue(throwError(() => ({ // Simulamos un error 404 de la API
      status: 404,
      message: 'Cita no encontrada.'
    })))
    component.eliminarCita(id)
    expect(mockAppointmentsService.deleteAppointment).toHaveBeenCalledWith(id)
    expect(mockSnackbar.open).toHaveBeenCalledWith('Cita no encontrada.', 'Aceptar', { duration: 3000 })

    // Eliminación de la cita correcta
    deleteAppointmentSpy.and.returnValue(of(mockApiResponse))
    component.eliminarCita(id)
    expect(mockDialogService.closeAll).toHaveBeenCalled()
    expect(mockAppointmentsService.deleteAppointment).toHaveBeenCalledWith(id)
    expect(mockSnackbar.open).toHaveBeenCalledWith('Cita eliminada.', 'Aceptar', { duration: 3000 })
  })

  it('should show a modal to create an appointment from bookings, modalAgregarReservaCita()', async () => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    dialogServiceSpy.and.returnValue(Promise.resolve())
    const getBookingsServiceSpy = spyOn(bookingService, 'getAllBookings')
    getBookingsServiceSpy.and.returnValue(of(mockApiBookingResponseWithData))    
    
    await component.modalAgregarReservaCita()
    expect(mockDialogService.openDialog).toHaveBeenCalledWith({html: component.modalReservaCita, title: 'Crear cita desde reserva', btnCancel: 'cancelar'})
    expect(mockBookingsService.getAllBookings).toHaveBeenCalled()
  })

  it('should get all bookings, getReservas()', () => {
    const getBookingsServiceSpy = spyOn(bookingService, 'getAllBookings')
    getBookingsServiceSpy.and.returnValue(throwError(() => ({ // Simulamos un error 500 de la API
      status: 500,
      message: 'Ha ocurrido un error.'
    })))

    // Error getBookings
    component.getReservas()
    expect(mockBookingsService.getAllBookings).toHaveBeenCalled()
    expect(component.reservas).toEqual([])
    expect(mockSnackbar.open).toHaveBeenCalledWith('No se ha podido obtener las reservas.', 'Aceptar', { duration: 3000 })

    // getBookings correcto
    const formatedBookings = [
      {
        id: '1C1E2A0D4D0311F08DAED8BBC1B70204',
        nombre: 'Pepe',
        apellidos: 'Gutiérrez Codes',
        email: 'pgutierrezcodes@hotmail.com',
        telefono: '1234',
        fecha: '27/06/2025',
        hora: '18:00:00'
      }, 
      {
        id: 'EC58142A4C7011F09077D8BBC1B70204',
        nombre: 'Francisca',
        apellidos: 'Serrano',
        email: 'fserrano@gmail.com',
        telefono: '665587787',
        fecha: '30/06/2025',
        hora: '18:30:00'
      }
    ]
    getBookingsServiceSpy.and.returnValue(of(mockApiBookingResponseWithData))
    component.getReservas()
    expect(mockBookingsService.getAllBookings).toHaveBeenCalled()
    expect(component.reservas).toEqual(formatedBookings)
  })

  it('should delete a booking, eliminarReserva()', () => {
    const deleteBookingServiceSpy = spyOn(bookingService, 'deleteBooking')
    const id = '1C1E2A0D4D0311F08DAED8BBC1B70204'

    // Error 404
    deleteBookingServiceSpy.and.returnValue(throwError(() => ({ // Simulamos un error 404 de la API
      status: 404,
      message: 'Reserva no encontrada.'
    })))
    component.eliminarReserva(id)
    expect(mockBookingsService.deleteBooking).toHaveBeenCalledWith(id)
    expect(mockSnackbar.open).toHaveBeenCalledWith('No se ha eliminado la reserva al crear la cita.', 'Aceptar', { duration: 3000 })

    // Elimación correcta de la reserva
    deleteBookingServiceSpy.and.returnValue(of(mockApiResponse))
    component.eliminarReserva(id)
    expect(mockBookingsService.deleteBooking).toHaveBeenCalledWith(id)
  })

  it('should create an appointment from bookings, crearReservaCita()', () => {
    const id = '1C1E2A0D4D0311F08DAED8BBC1B70204'
    const reservas = [
      {
        "id": "1C1E2A0D4D0311F08DAED8BBC1B70204",
        "nombre": "Pepe",
        "apellidos": "Gutiérrez Codes",
        "email": "pgutierrezcodes@hotmail.com",
        "telefono": "1234",
        "fecha": "27/06/2025",
        "hora": "18:00:00"
      },
      {
        "id": "EC58142A4C7011F09077D8BBC1B70204",
        "nombre": "Francisca",
        "apellidos": "Serrano",
        "email": "fserrano@gmail.com",
        "telefono": "665587787",
        "fecha": "30/06/2025",
        "hora": "18:30:00"
      }
    ]
    const reservaFormateada = {
      "nombre": "Pepe",
      "apellidos": "Gutiérrez Codes",
      "email": "pgutierrezcodes@hotmail.com",
      "telefono": "1234",
      "fecha": "2025-06-27",
      "hora": "18:00:00"
    }

    component.reservas = reservas
    const postAppointmentServiceSpy = spyOn(appointmentService, 'postAppointment')
    const deleteBookingServiceSpy = spyOn(bookingService, 'deleteBooking')
    deleteBookingServiceSpy.and.returnValue(of(mockApiResponse))

    // Error al crear la cita
    postAppointmentServiceSpy.and.returnValue(throwError(() => ({ // Simulamos un error 404 de la API
      status: 500,
      message: 'Cita no creada.'
    })))
    component.crearReservaCita(id)
    expect(mockAppointmentsService.postAppointment).toHaveBeenCalledWith(reservaFormateada)
    expect(mockSnackbar.open).toHaveBeenCalledWith('No se ha podido crear la cita.', 'Aceptar', { duration: 3000 })

    // Crea cita correctamente
    postAppointmentServiceSpy.and.returnValue(of(mockApiResponse))
    component.crearReservaCita(id)
    expect(mockAppointmentsService.postAppointment).toHaveBeenCalledWith(reservaFormateada)
    expect(mockSnackbar.open).toHaveBeenCalledWith('Cita creada.', 'Aceptar', { duration: 3000 })
    expect(mockBookingsService.deleteBooking).toHaveBeenCalledWith(id)
  })

  it('should have responsive design', () => {
    const responsiveServiceSpy = spyOn(responsiveService, 'obtenerDispositivo')
    responsiveServiceSpy.and.returnValue(of("Escritorio"))
      
    component.ngOnInit()
      
    expect(responsiveService.obtenerDispositivo).toHaveBeenCalled()
  })
});
