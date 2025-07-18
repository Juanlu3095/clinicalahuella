import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';

const mockComprobarCorrectLogin = {
  message: 'El usuario está autenticado.'
}

const mockComprobarIncorrectLogin = {
  error: 'El usuario no está autenticado.'
}

const mockCorrectLogin = {
  message: 'Usuario y contraseña correctos.',
  data: 'Pepe Pérez'
}

const mockIncorrectLogin = {
  error: 'Usuario y/o contraseña incorrectos.'
}

const mockCorrectLogout = {
  message: 'Cierre de sesión satisfactorio.'
}

const mockSesionExpirada = {
  error: 'El usuario no está autenticado o la sesión expiró.'
}

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController // Controlador para mockear peticiones, para simularlas, no API real
  const baseUrl = 'http://localhost:3000/auth' // Url que simulamos

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController)
  });

  afterEach(() => {
    httpTestingController.verify() // Nos aseguramos de que no se ejecute otra petición http pendiente mientras se realiza un test
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login the user, login()', () => {
    const authForm = {
      email: 'pperez@gmail.com',
      password: 'pperez'
    }
    service.login(authForm).subscribe((respuesta) => {
      expect(respuesta).toBe(mockCorrectLogin)
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/login`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('POST')
    expect(mockRequest.request.withCredentials).toBeTrue() // Comprobamos que el param sea el correcto

    mockRequest.flush(mockCorrectLogin)
  })

  it('should not login the user because wrong credentials, login()', () => {
    const authForm = {
      email: 'pperez@gmail.com',
      password: 'pperez'
    }
    service.login(authForm).subscribe({
      next: () => fail(),
      error: (error: HttpErrorResponse) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe('Usuario y/o contraseña incorrectos.')
        expect(error.status).toBe(401)
      }
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/login`)
    expect(mockRequest.request.method).toEqual('POST')
    expect(mockRequest.request.withCredentials).toBeTrue() // Comprobamos que el param sea el correcto

    mockRequest.flush(mockIncorrectLogin, { status: 401, statusText: 'Usuario y/o contraseña incorrectos.' })
  })

  it('should get authorized user, comprobarLogin()', () => {
    service.comprobarLogin().subscribe((respuesta) => {
      expect(respuesta).toBe(mockComprobarCorrectLogin)
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/login`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    expect(mockRequest.request.withCredentials).toBeTrue() // Comprobamos que el param sea el correcto

    mockRequest.flush(mockComprobarCorrectLogin)
  })

  it('should not get authorized user, comprobarLogin()', () => {
    service.comprobarLogin().subscribe({
      next: () => fail(),
      error: (error: HttpErrorResponse) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error).toBe(mockComprobarIncorrectLogin)
        expect(error.status).toBe(401)
      } 
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/login`)
    expect(mockRequest.request.method).toEqual('GET')
    expect(mockRequest.request.withCredentials).toBeTrue() // Comprobamos que el param sea el correcto

    mockRequest.flush(mockComprobarIncorrectLogin, { status: 401, statusText: 'El usuario no está autenticado.' })
  })

  it('should logout the user, logout()', () => {
    service.logout().subscribe((respuesta) => {
      expect(respuesta).toBe(mockCorrectLogout)
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/logout`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('POST')
    expect(mockRequest.request.withCredentials).toBeTrue() // Comprobamos que el param sea el correcto

    mockRequest.flush(mockCorrectLogout)
  })

  it('should not logout the user, logout()', () => {
    service.logout().subscribe({
      next: () => fail(),
      error: (error: HttpErrorResponse) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error).toBe(mockComprobarIncorrectLogin)
        expect(error.status).toBe(401)
      } 
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/logout`)
    expect(mockRequest.request.method).toEqual('POST')
    expect(mockRequest.request.withCredentials).toBeTrue() // Comprobamos que el param sea el correcto

    mockRequest.flush(mockComprobarIncorrectLogin, { status: 401, statusText: 'El usuario no está autenticado.' })
  })
});
