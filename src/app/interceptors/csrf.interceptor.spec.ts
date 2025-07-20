import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHeaders, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

import { csrfInterceptor } from './csrf.interceptor';
import { ApiresponsePartial } from '../interfaces/apiresponse';
import { Observable, of } from 'rxjs';
import { appConfig } from '../app.config';
import { CsrfService } from '../services/api/csrf.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

const mockCsrfService: {
  getCsrf: () => Observable<ApiresponsePartial>
} = {
  getCsrf: () => of({})
}

const mockResponseCsrfService = {
  'message': 'Token generado con éxito.'
}

const mockResponseCsrfServiceCookie = {
  'Set-Cookie': '_xsrf_token=abc123XYZ456random; Path=/; Secure; SameSite=None'
}

describe('csrfInterceptor', () => {
  let csrfService: CsrfService
  let cookieService: CookieService
  let httpClient: HttpClient
  let httpTestingController: HttpTestingController
  const baseUrl = 'http://localhost:3000' // Url que simulamos

  const interceptor: HttpInterceptorFn = (req, next) => 
    TestBed.runInInjectionContext(() => csrfInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        ...appConfig.providers,
        provideHttpClientTesting(),
        { provider: CsrfService, useValue: mockCsrfService }
      ]
    });

    csrfService = TestBed.inject(CsrfService)
    cookieService = TestBed.inject(CookieService)
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController)
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should send headers when there is _xsrf_token', () => {
    cookieService.set('_xsrf_token', 'token de prueba')
    httpClient.post(`${baseUrl}/newsletters`, { email: 'prueba@gmail.com' }).subscribe()
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/newsletters`)

    expect(mockRequest.request.headers.get('_xsrf_token')).toBeTruthy()
    expect(mockRequest.request.headers.get('_xsrf_token')).toBe('token de prueba')
  })

  it('should send headers when there is no _xsrf_token', () => {
    cookieService.delete('_xsrf_token')
    const spyCsrfService = spyOn(csrfService, 'getCsrf')
    spyCsrfService.and.returnValue(of(mockResponseCsrfService)) // Hacemos que el servicio CSRF Service devuelva un respuesta de la api con un message
    spyCsrfService.and.callFake(() => {
      cookieService.set('_xsrf_token', 'token de prueba') // Hacemos que también cree una cookie para simular lo que realmente hace la api
      return of({})
    })

    httpClient.post(`${baseUrl}/newsletters`, { email: 'prueba@gmail.com' }).subscribe() // Hacemos la petición
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/newsletters`)

    expect(csrfService.getCsrf).toHaveBeenCalled()
    expect(mockRequest.request.headers.get('_xsrf_token')).toBeTruthy()
    expect(mockRequest.request.headers.get('_xsrf_token')).toBe('token de prueba')

    mockRequest.flush(mockResponseCsrfService) // Mockeamos la petición
  })

  it('should not send headers when the request is GET', () => {
    cookieService.delete('_xsrf_token')
    httpClient.get(`${baseUrl}/posts`).subscribe()
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/posts`)

    expect(mockRequest.request.headers.get('_xsrf_token')).toBeNull() // En este caso, como la petición es GET, no se requiere el CSRF Token
  })
});
