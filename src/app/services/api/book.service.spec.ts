import { TestBed } from '@angular/core/testing';

import { BookService } from './book.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { Booking } from '../../interfaces/book';

describe('BookService', () => {
  let service: BookService;
  let httpTestingController: HttpTestingController; // Para crear datos simulados
  const baseUrl = 'http://localhost:3000/bookings' // Url que simulamos

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(BookService);
    httpTestingController = TestBed.inject(HttpTestingController)
  });

  afterEach(() => {
    httpTestingController.verify() // Nos aseguramos de que no se ejecute otra petición http pendiente mientras se realiza un test
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all bookings', () => {
    const dummyResponse = {
      "message": "Reservas encontradas.",
      "data": [
        {
          "id": "EC58142A4C7011F09077D8BBC1B70204",
          "nombre": "Francisca",
          "apellidos": "Serrano",
          "email": "fserrano@gmail.com",
          "telefono": "665587787",
          "fecha": "2025-06-29T22:00:00.000Z",
          "hora": "18:30:00"
        },
        {
          "id": "EC58142A4C7011F09077D8BBC1B70204",
          "nombre": "Alberto",
          "apellidos": "Moreno",
          "email": "amoreno@gmail.com",
          "telefono": "667152357",
          "fecha": "2025-06-25T22:00:00.000Z",
          "hora": "19:30:00"
        }
      ]
    }
  
    service.getAllBookings().subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.data).toHaveSize(2) // Comprobamos que data contenga 2 elementos
      expect(respuesta).toBe(dummyResponse)
      const firstBook: Booking = respuesta.data.find((cita: Booking) => cita.id === 'EC58142A4C7011F09077D8BBC1B70204')
      expect(firstBook.nombre).toBe("Francisca")
    })
    const mockRequest = httpTestingController.expectOne(baseUrl) // Le pasamos el timestamp por el SSR
    expect(mockRequest.request.method).toEqual('GET')
          
    // flush debe ir siempre después de la suscripción al método del servicio, ya que éste espera resolver la petición, la cual no lo
    // hace porque es simulada con provideHttpClientTesting y HttpTestingController. Sin el flush, la petición se queda esperando
    // para siempre.
    mockRequest.flush(dummyResponse)
  })
  
  it('should get a booking by id', () => {
    const dummyResponse = {
      message: 'Reserva encontrada.',
      data: [
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
  
    service.getBooking('EC58142A4C7011F09077D8BBC1B70204').subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.data).toHaveSize(1)
      expect(respuesta.data[0].nombre).toBe("Francisca")
      expect(respuesta.data[0].id).toBe("EC58142A4C7011F09077D8BBC1B70204")
    })
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/EC58142A4C7011F09077D8BBC1B70204`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
  
    mockRequest.flush(dummyResponse)
  })
  
  it('should not get a booking by id because not found', () => {
    const dummyResponse = {
      "error": "Reserva no encontrada."
    }
       
    const wrongIdPost = '1'
        
    service.getBooking(wrongIdPost).subscribe({
      next: () => fail,
      error: (error: HttpErrorResponse) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Reserva no encontrada.")
        expect(error.status).toBe(404)
      }
    })
        
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${wrongIdPost}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    mockRequest.flush(dummyResponse, { status: 404, statusText: 'Not found.' })
    // flush => incluso errores con código 400 ó 500
    // error => errores de red, cors
  })
  
  it('should create a booking', () => {
    const dummyResponse = {
      "message": "Reserva creada."
    }
  
    const bookingForm = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '18:00',
    }
  
    service.postBooking(bookingForm).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.message).toBe("Reserva creada.")
    })
  
    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('POST')
    mockRequest.flush(dummyResponse)
  })
  
  it('should not create a booking because validation fails', () => {
    const dummyResponse = {
      "error": "El campo nombre es requerido."
    }
  
    const bookingForm = {
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '18:00',
    }
  
    service.postBooking(bookingForm).subscribe({
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
  
  it('should not create a booking', () => {
    const dummyResponse = {
      "error": "Reserva no creada."
    }
  
    const bookingForm = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '18:00',
    }
  
    service.postBooking(bookingForm).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Reserva no creada.")
        expect(error.status).toBe(500)
      }
    })
  
    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('POST')
    mockRequest.flush(dummyResponse, { status: 500, statusText: 'Internal server error.' })
  })
  
  it('should update booking by id', () => {
    const dummyResponse = {
      "message": "Reserva actualizada."
    }
  
    const updateForm = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '17:00',
    }
  
    const idBooking = 'EC58142A4C7011F09077D8BBC1B70204'
    service.updateBooking(idBooking, updateForm).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.message).toBe("Reserva actualizada.")
    })
  
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idBooking}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('PATCH')
    mockRequest.flush(dummyResponse)
  })
  
  it('should not update a booking because not found', () => {
    const dummyResponse = {
      "error": "Reserva no encontrada."
    }
  
    const updateForm = {
      nombre: 'Javier',
      apellidos: 'Lozano',
      email: 'jlozano@gmail.com',
      telefono: '640876911',
      fecha: '2025-06-18',
      hora: '17:00',
    }
  
    const idBooking = '1'
  
    service.updateBooking(idBooking, updateForm).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Reserva no encontrada.")
        expect(error.status).toBe(404)
      }
    })
  
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idBooking}`) // Hacemos la petición
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
  
    const idBooking = 'EC58142A4C7011F09077D8BBC1B70204'
  
    service.updateBooking(idBooking, updateForm).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("El campo nombre es requerido.")
        expect(error.status).toBe(422)
      }
    })
  
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idBooking}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('PATCH')
    mockRequest.flush(dummyResponse, { status: 422, statusText: 'Unprocessable object.' })
  })
  
  it('should delete an appointment by id', () => {
    const dummyResponse = {
      message: 'Reserva eliminada.'
    }
  
    const idBooking = 'EC58142A4C7011F09077D8BBC1B70204'
  
    service.deleteBooking(idBooking).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy()
      expect(respuesta.message).toBe('Reserva eliminada.')
    })
  
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idBooking}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('DELETE')
    mockRequest.flush(dummyResponse)
  })
  
  it('should not delete an appointment because not found', () => {
    const dummyResponse = {
      "error": "Reserva no encontrada."
    }
  
    const idAppointment = '1'
  
    service.deleteBooking(idAppointment).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Reserva no encontrada.")
        expect(error.status).toBe(404)
      }
    })
  
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idAppointment}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('DELETE')
    mockRequest.flush(dummyResponse, { status: 404, statusText: 'Not found.' })
  })

  it('should delete a selection of bookings', () => {
    const ids = ['EC58142A4C7011F09077D8BBC1B70204','EC58142A4C7011F09077D8BBC1B70204']
    const dummyResponse = {
      "message": "Reservas eliminadas."
    }
    
    service.deleteBookings(ids).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy()
      expect(respuesta.message).toBe("Reservas eliminadas.")
    })

    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición, las ids van en el body
    expect(mockRequest.request.method).toEqual('DELETE')
    expect(mockRequest.request.body['ids']).toBe(ids)
    mockRequest.flush(dummyResponse) 
  })

  it('should not delete a selection of bookings because not found', () => {
    const ids = ['1','2']
    const dummyResponse = {
      "error": "Reservas no encontradas."
    }
    
    service.deleteBookings(ids).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy()
        expect(error.error.error).toBe('Reservas no encontradas.')
        expect(error.status).toBe(404)
      }
    })

    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('DELETE')
    expect(mockRequest.request.body['ids']).toBe(ids)
    mockRequest.flush(dummyResponse, { status: 404, statusText: 'Not found.' })
  })
});
