import { TestBed } from '@angular/core/testing';

import { AnalyticsService } from './analytics.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let httpTestingController: HttpTestingController // Controlador para mockear peticiones, para simularlas, no API real
  const baseUrl = 'http://localhost:3000/analytics' // Url que simulamos

  const mockAnalyticsPageUrl = {
    "message": "Datos encontrados.",
    "data": [
      {
        "dimension": "/contacto",
        "value": "44"
      },
      {
        "dimension": "/",
        "value": "20"
      }
    ]
  }

  const mockAnalyticsCountry = {
    "message": "Datos encontrados.",
    "data": [
      {
        "dimension": "Spain",
        "value": "323"
      }
    ]
  }

  const mockAnalyticsCity = {
    "message": "Datos encontrados.",
    "data": [
      {
        "dimension": "Malaga",
        "value": "323"
      }
    ]
  }

  const mockAnalyticsDevice = {
    "message": "Datos encontrados.",
    "data": [
      {
        "dimension": "desktop",
        "value": "224"
      },
      {
        "dimension": "mobile",
        "value": "99"
      }
    ]
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AnalyticsService);
    httpTestingController = TestBed.inject(HttpTestingController)
  });

  afterEach(() => {
    httpTestingController.verify() // Nos aseguramos de que no se ejecute otra petición http pendiente mientras se realiza un test
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get Analytics data by page url, getPageUrlData()', () => {
    service.getPageUrlData().subscribe((respuesta) => {
      expect(respuesta.data).toBe(mockAnalyticsPageUrl.data)
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/pageurl`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    expect(mockRequest.request.withCredentials).toBeTrue() // Comprobamos que el param sea el correcto

    mockRequest.flush(mockAnalyticsPageUrl)
  })

  it('should get Analytics data by country, getCountriesData()', () => {
    service.getCountriesData().subscribe((respuesta) => {
      expect(respuesta.data).toBe(mockAnalyticsCountry.data)
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/country`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    expect(mockRequest.request.withCredentials).toBeTrue() // Comprobamos que el param sea el correcto

    mockRequest.flush(mockAnalyticsCountry)
  })

  it('should get Analytics data by city, getCitiesData()', () => {
    service.getCitiesData().subscribe((respuesta) => {
      expect(respuesta.data).toBe(mockAnalyticsCity.data)
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/city`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    expect(mockRequest.request.withCredentials).toBeTrue() // Comprobamos que el param sea el correcto

    mockRequest.flush(mockAnalyticsCity)
  })

  it('should get Analytics data by device, getDevicesData()', () => {
    service.getDevicesData().subscribe((respuesta) => {
      expect(respuesta.data).toBe(mockAnalyticsDevice.data)
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/device`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    expect(mockRequest.request.withCredentials).toBeTrue() // Comprobamos que el param sea el correcto

    mockRequest.flush(mockAnalyticsDevice)
  })
});
