import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { NewsletterService } from './newsletter.service';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { Newsletter } from '../../interfaces/newsletter';

describe('NewsletterService', () => {
  let service: NewsletterService;
  let httpTestingController: HttpTestingController; // Para crear datos simulados
  const baseUrl = 'http://localhost:3000/newsletters' // Url que simulamos

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }); // provideHttpClientTesting no hace peticiones reales
    service = TestBed.inject(NewsletterService);
    httpTestingController = TestBed.inject(HttpTestingController)
  });

  afterEach(() => {
    httpTestingController.verify() // Nos aseguramos de que no se ejecute otra petición http pendiente mientras se realiza un test
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all newsletters', () => {
    const dummyResponse = {
      "message": "Newsletters encontradas",
      "data": [
        {
          "id": "67EA449C15F111F084AFD8BBC1B70204",
          "email": "jdevtoday25@gmail.com"
        },
        {
          "id": "67EB08A815F111F084AFD8BBC1B70204",
          "email": "easyshop.notifications@gmail.com"
        },
        {
          "id": "CD2082B7187311F0B6F0D8BBC1B70204",
          "email": "pepe@gmail.com"
        }
      ]
    }

    service.getNewsletters().subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.data).toHaveSize(3) // Comprobamos que data contenga 3 elementos
      const firstNews: Newsletter = respuesta.data.find((newsletter: Newsletter) => newsletter.id === "67EA449C15F111F084AFD8BBC1B70204")
      expect(firstNews.email).toBe("jdevtoday25@gmail.com")
    })
    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')

    // flush debe ir siempre después de la suscripción al método del servicio, ya que éste espera resolver la petición, la cual no lo
    // hace porque es simulada con provideHttpClientTesting y HttpTestingController. Sin el flush, la petición se queda esperando
    // para siempre.
    mockRequest.flush(dummyResponse)
  })

  xit('should no get all newsletters because CORS', () => { // Aquí se usaria error() y no flush()

  })

  it('should get a newsletter by id', () => {
    const dummyResponse = {
      "message": "Newsletter encontrada.",
      "data": {
        "id": "CD2082B7187311F0B6F0D8BBC1B70204",
          "email": "pepe@gmail.com"
      }
    }

    const idNewsletter = "CD2082B7187311F0B6F0D8BBC1B70204"

    service.getNewsletter(idNewsletter).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.data.email).toBe("pepe@gmail.com") // Comprobamos que el email sea el que esperamos
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idNewsletter}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    mockRequest.flush(dummyResponse)
  })

  it('should not get a newsletter by id because newsletter was not found', () => {
    const dummyResponse = {
      "error": "Newsletter no encontrada."
    }

    const wrongIdNewsletter = "1"

    service.getNewsletter(wrongIdNewsletter).subscribe({
      next: () => fail,
      error: (error: HttpErrorResponse) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Newsletter no encontrada.")
        expect(error.status).toBe(404)
      }
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${wrongIdNewsletter}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    mockRequest.flush(dummyResponse, { status: 404, statusText: 'Not found.' })
    // flush => incluso errores con código 400 ó 500
    // error => errores de red, cors
  })

  it('should create a newsletter', () => {
    const dummyResponse = {
      "message": "Newsletter creada."
    }

    const newsForm = {
      email: "pjimenez@gmail.com"
    }

    service.postNewsletter(newsForm).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.message).toBe("Newsletter creada.") // Comprobamos que el email sea el que esperamos
    })

    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('POST')
    mockRequest.flush(dummyResponse)
  })

  it('should update a newsletter', () => {
    const dummyResponse = {
      "message": "Newsletter actualizada."
    }

    const idNewsletter = "67EA449C15F111F084AFD8BBC1B70204"

    const newsForm = {
      email: "pjimenez@gmail.com"
    }

    service.updateNewsletter(idNewsletter, newsForm).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.message).toBe("Newsletter actualizada.") // Comprobamos que el email sea el que esperamos
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idNewsletter}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('PATCH')
    mockRequest.flush(dummyResponse)
  })

  it('should not update a newsletter because newsletter was not found', () => {
    const dummyResponse = {
      "error": "Newsletter no encontrada."
    }

    const wrongIdNewsletter = "1"

    const newsForm = {
      email: "pjimenez@gmail.com"
    }

    service.updateNewsletter(wrongIdNewsletter, newsForm).subscribe({
      next: fail,
      error: (error: HttpErrorResponse) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Newsletter no encontrada.")
        expect(error.status).toBe(404)
      }
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${wrongIdNewsletter}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('PATCH')
    mockRequest.flush(dummyResponse, { status: 404, statusText: 'Not found.' })
  })

  it('should delete a newsletter', () => {
    const dummyResponse = {
      "message": "Newsletter eliminada."
    }

    const idNewsletter = "67EA449C15F111F084AFD8BBC1B70204"

    service.deleteNewsletter(idNewsletter).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.message).toBe("Newsletter eliminada.") // Comprobamos que el email sea el que esperamos
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idNewsletter}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('DELETE')
    mockRequest.flush(dummyResponse)
  })

  it('should not delete a newsletter because newsletter was not found', () => {
    const dummyResponse = {
      "error": "Newsletter no encontrada."
    }

    const wrongIdNewsletter = "1"

    service.deleteNewsletter(wrongIdNewsletter).subscribe({
      next: fail,
      error: (error: HttpErrorResponse) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Newsletter no encontrada.")
        expect(error.status).toBe(404)
      }
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${wrongIdNewsletter}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('DELETE')
    mockRequest.flush(dummyResponse, { status: 404, statusText: 'Not found.' })
  })

  it('should delete selected ids', () => {
    const ids = ['67EA449C15F111F084AFD8BBC1B70204']
    const dummyResponse = {
      "message": "Newsletters eliminadas."
    }
    
    service.deleteSelectedNewsletter(ids).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy()
      expect(respuesta.message).toBe("Newsletters eliminadas.")
    })

    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('DELETE')
    mockRequest.flush(dummyResponse) 
  })

  it('should not delete selected ids', () => {
    const wrongIds = ['1']
    const dummyResponse = {
      "error": "Newsletters no encontradas."
    }
    
    service.deleteSelectedNewsletter(wrongIds).subscribe({
      next: fail,
      error: (error: HttpErrorResponse) => {
        expect(error).toBeTruthy()
        expect(error.error.error).toBe("Newsletters no encontradas.")
        expect(error.status).toBe(404)
      }
    })

    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('DELETE')
    mockRequest.flush(dummyResponse, { status: 404, statusText: 'Not found.'}) 
  })
});
