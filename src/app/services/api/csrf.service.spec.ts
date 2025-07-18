import { TestBed } from '@angular/core/testing';

import { CsrfService } from './csrf.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiresponsePartial } from '../../interfaces/apiresponse';

describe('CsrfService', () => {
  let service: CsrfService;
  let httpTestingController: HttpTestingController; // Para crear datos simulados
  const baseUrl = 'http://localhost:3000/csrf' // Url que simulamos

  const mockCsrfServiceResponse = {
    "message": "Token generado con éxito."
  }
  
  const mockHeaders = {
    'Set-Cookie': '_xsrf_token=7be42e26d97b75123b8de37aea1c59a745058b9fbbb3dda5b14d51d0148dd762.c5fbd41448d959b6172b05e17725d6420185457451d5cc570374a60dbda590c0; Max-Age=3600; Path=/; Expires=Thu, 17 Jul 2025 22:21:53 GMT; Secure; SameSite=None'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CsrfService);
    httpTestingController = TestBed.inject(HttpTestingController)
  });

  afterEach(() => {
    httpTestingController.verify() // Nos aseguramos de que no se ejecute otra petición http pendiente mientras se realiza un test
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get csrf token as cookie, getCsrf()', () => {
    // No se testea la cookie porque lo maneja automáticamente el navegador
    service.getCsrf().subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta.message).toBe(mockCsrfServiceResponse.message)
    })
    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    expect(mockRequest.request.withCredentials).toBeTrue()
    mockRequest.flush(mockCsrfServiceResponse, {
      headers: mockHeaders
    })
  })
});
