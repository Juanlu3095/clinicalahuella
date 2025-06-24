import { TestBed } from '@angular/core/testing';

import { AppointmentService } from './appointment.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { Appointment } from '../../interfaces/appointment';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpTestingController: HttpTestingController; // Para crear datos simulados
  const baseUrl = 'http://localhost:3000/appointments' // Url que simulamos

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AppointmentService);
    httpTestingController = TestBed.inject(HttpTestingController)
  });

  afterEach(() => {
    httpTestingController.verify() // Nos aseguramos de que no se ejecute otra petición http pendiente mientras se realiza un test
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  it('should get all appointments', () => {
    const dummyResponse = {
      "message": "Citas encontradas.",
      "data": [
        {
          "id": "27AE4A544A9E11F0A935D8BBC1B70204",
          "nombre": "Pepe",
          "apellidos": "Sánchez",
          "email": "pepe@gmail.es",
          "telefono": "123456789",
          "fecha": "2025-06-25T22:00:00.000Z",
          "hora": "17:30:00",
          "created_at": "2025-06-16T10:39:18.000Z",
          "updated_at": "2025-06-18T12:53:54.000Z"
        },
        {
          "id": "190598454BA311F0A306D8BBC1B70204",
          "nombre": "Ramón",
          "apellidos": "García",
          "email": "rgarcia@gmail.com",
          "telefono": "111111",
          "fecha": "2025-06-02T22:00:00.000Z",
          "hora": "12:00:00",
          "created_at": "2025-06-17T17:47:12.000Z",
          "updated_at": "2025-06-17T17:47:12.000Z"
        }
      ]
    }

    service.getAllAppointments().subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.data).toHaveSize(2) // Comprobamos que data contenga 2 elementos
      const firstAppointment: Appointment = respuesta.data.find((cita: Appointment) => cita.id === '27AE4A544A9E11F0A935D8BBC1B70204')
      expect(firstAppointment.nombre).toBe("Pepe")
      expect(respuesta).toBe(dummyResponse)
    })
    const mockRequest = httpTestingController.expectOne(`${baseUrl}?timestamp=${Date.now().toString()}`) // Le pasamos el timestamp por el SSR
    expect(mockRequest.request.method).toEqual('GET')
        
    // flush debe ir siempre después de la suscripción al método del servicio, ya que éste espera resolver la petición, la cual no lo
    // hace porque es simulada con provideHttpClientTesting y HttpTestingController. Sin el flush, la petición se queda esperando
    // para siempre.
    mockRequest.flush(dummyResponse)
  })

  it('should get an appointment by id', () => {
    const dummyResponse = {
      message: 'Cita encontrada.',
      data: [
        {
          "id": "27AE4A544A9E11F0A935D8BBC1B70204",
          "nombre": "Pepe",
          "apellidos": "Sánchez",
          "email": "pepe@gmail.es",
          "telefono": "123456789",
          "fecha": "2025-06-25T22:00:00.000Z",
          "hora": "17:30:00",
          "created_at": "2025-06-16T10:39:18.000Z",
          "updated_at": "2025-06-18T12:53:54.000Z"
        }
      ]
    }

    service.getAppointment('27AE4A544A9E11F0A935D8BBC1B70204').subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.data).toHaveSize(1)
      expect(respuesta.data[0].nombre).toBe("Pepe")
    })
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/27AE4A544A9E11F0A935D8BBC1B70204`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')

    mockRequest.flush(dummyResponse)
  })

  it('should not get an appointment by id because not found', () => {
    const dummyResponse = {
      "error": "Cita no encontrada."
    }
      
    const wrongIdPost = '1'
      
    service.getAppointment(wrongIdPost).subscribe({
      next: () => fail,
      error: (error: HttpErrorResponse) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Cita no encontrada.")
        expect(error.status).toBe(404)
      }
    })
      
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${wrongIdPost}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    mockRequest.flush(dummyResponse, { status: 404, statusText: 'Not found.' })
    // flush => incluso errores con código 400 ó 500
    // error => errores de red, cors
  })

  it('should create an appointment', () => {
    const dummyResponse = {
      "message": "Cita creada."
    }

    const appointmentForm = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '18:00',
    }

    service.postAppointment(appointmentForm).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.message).toBe("Cita creada.")
    })

    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('POST')
    mockRequest.flush(dummyResponse)
  })

  it('should not create an appointment because validation fails', () => {
    const dummyResponse = {
      "error": "El campo nombre es requerido."
    }

    const appointmentForm = {
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '18:00',
    }

    service.postAppointment(appointmentForm).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("El campo nombre es requerido.")
        expect(error.status).toBe(422)
      }
    })

    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('POST')
    mockRequest.flush(dummyResponse, { status: 422, statusText: 'Unprocessable object.' })
  })

  it('should not create an appointment', () => {
    const dummyResponse = {
      "error": "Cita no creada."
    }

    const appointmentForm = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '18:00',
    }

    service.postAppointment(appointmentForm).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Cita no creada.")
        expect(error.status).toBe(500)
      }
    })

    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('POST')
    mockRequest.flush(dummyResponse, { status: 500, statusText: 'Internal server error.' })
  })

  it('should update an appointment by id', () => {
    const dummyResponse = {
      "message": "Cita actualizada."
    }

    const updateForm = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '17:00',
    }

    const idAppointment = '190598454BA311F0A306D8BBC1B70204'
    service.updateAppointment(idAppointment, updateForm).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.message).toBe("Cita actualizada.")
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idAppointment}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('PATCH')
    mockRequest.flush(dummyResponse)
  })

  it('should not update a post because not found', () => {
    const dummyResponse = {
      "error": "Cita no encontrada."
    }

    const updateForm = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '17:00',
    }

    const idAppointment = '3'

    service.updateAppointment(idAppointment, updateForm).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Cita no encontrada.")
        expect(error.status).toBe(404)
      }
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idAppointment}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('PATCH')
    mockRequest.flush(dummyResponse, { status: 404, statusText: 'Not found.' })
  })

  it('should not update a post because validation fails', () => {
    const dummyResponse = {
      "error": "El campo nombre es requerido."
    }

    const updateForm = {
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '17:00',
    }

    const idAppointment = '190598454BA311F0A306D8BBC1B70204'

    service.updateAppointment(idAppointment, updateForm).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("El campo nombre es requerido.")
        expect(error.status).toBe(422)
      }
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idAppointment}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('PATCH')
    mockRequest.flush(dummyResponse, { status: 422, statusText: 'Unprocessable object.' })
  })

  it('should delete an appointment by id', () => {
    const dummyResponse = {
      message: 'Cita eliminada.'
    }

    const idAppointment = '190598454BA311F0A306D8BBC1B70204'

    service.deleteAppointment(idAppointment).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy()
      expect(respuesta.message).toBe('Cita eliminada.')
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idAppointment}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('DELETE')
    mockRequest.flush(dummyResponse)
  })

  it('should not delete an appointment because not found', () => {
    const dummyResponse = {
      "error": "Cita no encontrada."
    }

    const idAppointment = '1'

    service.deleteAppointment(idAppointment).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Cita no encontrada.")
        expect(error.status).toBe(404)
      }
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idAppointment}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('DELETE')
    mockRequest.flush(dummyResponse, { status: 404, statusText: 'Not found.' })
  })
});
